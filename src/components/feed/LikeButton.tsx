import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLikePost } from '@/hooks/usePosts'
import { supabase } from '@/integrations/supabase/client'
import { cn } from '@/lib/utils'

interface LikeButtonProps {
  postId: string
  creatorId: string
  initialLikeCount: number
  initialIsLiked?: boolean
}

export function LikeButton({ postId, creatorId, initialLikeCount, initialIsLiked = false }: LikeButtonProps) {
  const [userId, setUserId] = useState<string | null>(null)
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const likeMutation = useLikePost()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null)
    })
  }, [])

  useEffect(() => {
    setIsLiked(initialIsLiked)
    setLikeCount(initialLikeCount)
  }, [initialIsLiked, initialLikeCount])

  const handleLike = async () => {
    if (!userId) {
      // Could show a toast to login
      return
    }

    // Optimistic update
    const wasLiked = isLiked
    setIsLiked(!wasLiked)
    setLikeCount(prev => wasLiked ? prev - 1 : prev + 1)

    try {
      await likeMutation.mutateAsync({ postId, userId, creatorId })
    } catch (error) {
      // Revert on error
      setIsLiked(wasLiked)
      setLikeCount(prev => wasLiked ? prev + 1 : prev - 1)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      disabled={!userId || likeMutation.isPending}
      className="gap-1.5"
    >
      <Heart
        className={cn(
          'h-4 w-4 transition-colors',
          isLiked && 'fill-red-500 text-red-500'
        )}
      />
      <span className="text-sm">{likeCount}</span>
    </Button>
  )
}
