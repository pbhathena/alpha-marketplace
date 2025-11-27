import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Post, Insertable, PostVisibility } from '@/types/database'
import { toast } from 'sonner'

export interface PostWithCreator extends Post {
  profiles: {
    id: string
    full_name: string | null
    username: string | null
    avatar_url: string | null
  }
  user_has_liked?: boolean
}

interface CreatePostData {
  title: string
  content: string | null
  media_urls: string[]
  visibility: PostVisibility
  is_pinned: boolean
}

interface UpdatePostData {
  id: string
  title?: string
  content?: string | null
  media_urls?: string[]
  visibility?: PostVisibility
  is_pinned?: boolean
}

export function usePosts(creatorId: string) {
  return useQuery<PostWithCreator[]>({
    queryKey: ['posts', creatorId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:creator_id (
            id,
            full_name,
            username,
            avatar_url
          )
        `)
        .eq('creator_id', creatorId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error

      // Check if current user has liked each post
      if (user && data) {
        const postIds = data.map((post: any) => post.id)
        const { data: likes } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds)

        const likedPostIds = new Set((likes as any)?.map((like: any) => like.post_id) || [])

        return data.map((post: any) => ({
          ...post,
          user_has_liked: likedPostIds.has(post.id)
        })) as PostWithCreator[]
      }

      return data as PostWithCreator[]
    },
  })
}

export function useCreatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ creatorId, data }: { creatorId: string; data: CreatePostData }) => {
      const postData: Insertable<'posts'> = {
        creator_id: creatorId,
        title: data.title,
        content: data.content,
        media_urls: data.media_urls,
        visibility: data.visibility,
        is_pinned: data.is_pinned,
        published_at: new Date().toISOString(),
      }

      const { data: post, error } = await supabase
        .from('posts')
        .insert(postData as any)
        .select()
        .single()

      if (error) throw error
      return post
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['posts', variables.creatorId] })
      toast.success('Post created successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to create post: ${error.message}`)
    },
  })
}

export function useUpdatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ creatorId, data }: { creatorId: string; data: UpdatePostData }) => {
      const { id, ...updateData } = data

      const { data: post, error } = await supabase
        .from('posts')
        // @ts-ignore - Supabase type inference issue with partial updates
        .update(updateData)
        .eq('id', id)
        .eq('creator_id', creatorId)
        .select()
        .single()

      if (error) throw error
      return post
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['posts', variables.creatorId] })
      toast.success('Post updated successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to update post: ${error.message}`)
    },
  })
}

export function useDeletePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ creatorId, postId }: { creatorId: string; postId: string }) => {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('creator_id', creatorId)

      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['posts', variables.creatorId] })
      toast.success('Post deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete post: ${error.message}`)
    },
  })
}

export function useLikePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ postId, userId }: { postId: string; userId: string; creatorId: string }) => {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .maybeSingle()

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId)

        if (error) throw error

        // Decrement like count
        const { error: updateError } = await supabase.rpc('decrement_like_count', { post_id: postId } as any)
        if (updateError) {
          // Fallback if RPC doesn't exist
          const { data: post } = await supabase
            .from('posts')
            .select('like_count')
            .eq('id', postId)
            .single()

          if (post) {
            await supabase
              .from('posts')
              // @ts-ignore - Supabase type inference issue
              .update({ like_count: Math.max(0, (post as any).like_count - 1) })
              .eq('id', postId)
          }
        }

        return { liked: false }
      } else {
        // Like
        const { error } = await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: userId } as any)

        if (error) throw error

        // Increment like count
        const { error: updateError } = await supabase.rpc('increment_like_count', { post_id: postId } as any)
        if (updateError) {
          // Fallback if RPC doesn't exist
          const { data: post } = await supabase
            .from('posts')
            .select('like_count')
            .eq('id', postId)
            .single()

          if (post) {
            await supabase
              .from('posts')
              // @ts-ignore - Supabase type inference issue
              .update({ like_count: (post as any).like_count + 1 })
              .eq('id', postId)
          }
        }

        return { liked: true }
      }
    },
    onMutate: async ({ postId, creatorId }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['posts', creatorId] })

      const previousPosts = queryClient.getQueryData<PostWithCreator[]>(['posts', creatorId])

      queryClient.setQueryData<PostWithCreator[]>(['posts', creatorId], (old) => {
        if (!old) return old
        return old.map(post => {
          if (post.id === postId) {
            const isCurrentlyLiked = post.user_has_liked
            return {
              ...post,
              user_has_liked: !isCurrentlyLiked,
              like_count: isCurrentlyLiked ? post.like_count - 1 : post.like_count + 1,
            }
          }
          return post
        })
      })

      return { previousPosts }
    },
    onError: (error: Error, variables, context) => {
      // Revert optimistic update on error
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts', variables.creatorId], context.previousPosts)
      }
      toast.error(`Failed to update like: ${error.message}`)
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ['posts', variables.creatorId] })
    },
  })
}

export function useUploadPostMedia() {
  return useMutation({
    mutationFn: async ({ file, creatorId }: { file: File; creatorId: string }) => {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${creatorId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('post-media')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('post-media')
        .getPublicUrl(filePath)

      return publicUrl
    },
    onError: (error: Error) => {
      toast.error(`Failed to upload media: ${error.message}`)
    },
  })
}
