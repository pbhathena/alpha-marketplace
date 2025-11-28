import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageCircle, Send, Inbox, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Spinner } from '@/components/ui/spinner'
import {
  useConversations,
  useMessages,
  useSendMessage,
  useMarkAsRead,
  ConversationWithProfile,
} from '@/hooks/useMessages'
import { cn } from '@/lib/utils'

export default function Messages() {
  const { user } = useAuth()
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithProfile | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: conversations, isLoading: loadingConversations } = useConversations(user?.id)
  const { data: messages, isLoading: loadingMessages } = useMessages(selectedConversation?.id)
  const sendMessage = useSendMessage()
  const markAsRead = useMarkAsRead()

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Mark as read when conversation is selected
  useEffect(() => {
    if (selectedConversation && user) {
      markAsRead.mutate({
        conversationId: selectedConversation.id,
        userId: user.id,
      })
    }
  }, [selectedConversation?.id, user?.id])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim() || !selectedConversation || !user) return

    await sendMessage.mutateAsync({
      conversationId: selectedConversation.id,
      senderId: user.id,
      content: messageInput,
    })
    setMessageInput('')
  }

  const getInitials = (name: string | null) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    } else if (days === 1) {
      return 'Yesterday'
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  if (loadingConversations) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Messages</h2>
        <p className="text-muted-foreground">
          Chat with creators you subscribe to
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="grid grid-cols-12 h-[600px]">
          {/* Conversation List */}
          <div className={cn(
            "col-span-12 md:col-span-4 border-r",
            selectedConversation && "hidden md:block"
          )}>
            <div className="p-4 border-b">
              <h3 className="font-semibold">Conversations</h3>
            </div>
            <ScrollArea className="h-[540px]">
              {conversations && conversations.length > 0 ? (
                <div className="divide-y">
                  {conversations.map((conv) => {
                    const unreadCount = conv.is_creator
                      ? conv.creator_unread_count
                      : conv.subscriber_unread_count

                    return (
                      <button
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv)}
                        className={cn(
                          "w-full p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors text-left",
                          selectedConversation?.id === conv.id && "bg-muted"
                        )}
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={conv.other_user.avatar_url || undefined} />
                          <AvatarFallback>{getInitials(conv.other_user.full_name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold truncate">{conv.other_user.full_name}</p>
                            <span className="text-xs text-muted-foreground">
                              {formatTime(conv.last_message_at)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {conv.last_message_preview || 'No messages yet'}
                          </p>
                          {unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-full mt-1">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Inbox className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No conversations yet</p>
                  <Link to="/explore" className="text-sm text-primary hover:underline mt-2 inline-block">
                    Find creators to message
                  </Link>
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Message Thread */}
          <div className={cn(
            "col-span-12 md:col-span-8 flex flex-col",
            !selectedConversation && "hidden md:flex"
          )}>
            {selectedConversation ? (
              <>
                {/* Conversation Header */}
                <div className="p-4 border-b flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setSelectedConversation(null)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <Link to={`/creator/${selectedConversation.other_user.username}`}>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedConversation.other_user.avatar_url || undefined} />
                      <AvatarFallback>{getInitials(selectedConversation.other_user.full_name)}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div>
                    <Link to={`/creator/${selectedConversation.other_user.username}`} className="hover:underline">
                      <p className="font-semibold">{selectedConversation.other_user.full_name}</p>
                    </Link>
                    <p className="text-xs text-muted-foreground">@{selectedConversation.other_user.username}</p>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  {loadingMessages ? (
                    <div className="flex justify-center py-8">
                      <Spinner />
                    </div>
                  ) : messages && messages.length > 0 ? (
                    <div className="space-y-4">
                      {messages.map((message) => {
                        const isOwnMessage = message.sender_id === user?.id

                        return (
                          <div
                            key={message.id}
                            className={cn(
                              "flex gap-3",
                              isOwnMessage && "flex-row-reverse"
                            )}
                          >
                            {!isOwnMessage && (
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={message.sender.avatar_url || undefined} />
                                <AvatarFallback>{getInitials(message.sender.full_name)}</AvatarFallback>
                              </Avatar>
                            )}
                            <div className={cn(
                              "max-w-[70%]",
                              isOwnMessage && "text-right"
                            )}>
                              <div className={cn(
                                "inline-block rounded-2xl px-4 py-2",
                                isOwnMessage
                                  ? "bg-primary text-primary-foreground rounded-br-md"
                                  : "bg-muted rounded-bl-md"
                              )}>
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatTime(message.created_at)}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  )}
                </ScrollArea>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                    disabled={sendMessage.isPending}
                  />
                  <Button type="submit" disabled={!messageInput.trim() || sendMessage.isPending}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="font-semibold text-lg mb-2">Select a conversation</h3>
                  <p className="text-sm">Choose a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
