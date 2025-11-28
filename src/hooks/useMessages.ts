import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Conversation, Message, Profile } from '@/types/database'
import { toast } from 'sonner'

export interface ConversationWithProfile extends Conversation {
  other_user: Profile
  is_creator: boolean
}

export interface MessageWithSender extends Message {
  sender: Profile
}

// Fetch all conversations for the current user
export function useConversations(userId: string | undefined) {
  return useQuery<ConversationWithProfile[]>({
    queryKey: ['conversations', userId],
    queryFn: async () => {
      if (!userId) return []

      // Get conversations where user is creator or subscriber
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          creator:creator_id (id, full_name, username, avatar_url),
          subscriber:subscriber_id (id, full_name, username, avatar_url)
        `)
        .or(`creator_id.eq.${userId},subscriber_id.eq.${userId}`)
        .order('last_message_at', { ascending: false })

      if (error) throw error

      // Transform to include other_user and is_creator
      return (data || []).map((conv: any) => {
        const isCreator = conv.creator_id === userId
        return {
          ...conv,
          other_user: isCreator ? conv.subscriber : conv.creator,
          is_creator: isCreator,
        }
      })
    },
    enabled: !!userId,
  })
}

// Fetch messages for a conversation
export function useMessages(conversationId: string | undefined) {
  const queryClient = useQueryClient()

  const query = useQuery<MessageWithSender[]>({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return []

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id (id, full_name, username, avatar_url)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data as MessageWithSender[]
    },
    enabled: !!conversationId,
  })

  // Subscribe to realtime messages
  useEffect(() => {
    if (!conversationId) return

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          // Fetch the full message with sender
          const { data } = await supabase
            .from('messages')
            .select(`
              *,
              sender:sender_id (id, full_name, username, avatar_url)
            `)
            .eq('id', payload.new.id)
            .single()

          if (data) {
            queryClient.setQueryData<MessageWithSender[]>(
              ['messages', conversationId],
              (old) => [...(old || []), data as MessageWithSender]
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, queryClient])

  return query
}

// Send a message
export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      conversationId,
      senderId,
      content,
    }: {
      conversationId: string
      senderId: string
      content: string
    }) => {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          content: content.trim(),
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
    onError: (error: Error) => {
      toast.error(`Failed to send message: ${error.message}`)
    },
  })
}

// Create or get existing conversation
export function useCreateConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      creatorId,
      subscriberId,
    }: {
      creatorId: string
      subscriberId: string
    }) => {
      // Check if conversation exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('*')
        .eq('creator_id', creatorId)
        .eq('subscriber_id', subscriberId)
        .single()

      if (existing) return existing

      // Create new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          creator_id: creatorId,
          subscriber_id: subscriberId,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
    onError: (error: Error) => {
      toast.error(`Failed to start conversation: ${error.message}`)
    },
  })
}

// Mark messages as read
export function useMarkAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      conversationId,
      userId,
    }: {
      conversationId: string
      userId: string
    }) => {
      // Mark all unread messages from the other user as read
      const { error: messagesError } = await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .eq('is_read', false)

      if (messagesError) throw messagesError

      // Get conversation to determine if user is creator or subscriber
      const { data: conv } = await supabase
        .from('conversations')
        .select('creator_id, subscriber_id')
        .eq('id', conversationId)
        .single()

      if (conv) {
        const isCreator = conv.creator_id === userId
        const updateField = isCreator ? 'creator_unread_count' : 'subscriber_unread_count'

        await supabase
          .from('conversations')
          .update({ [updateField]: 0 })
          .eq('id', conversationId)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}
