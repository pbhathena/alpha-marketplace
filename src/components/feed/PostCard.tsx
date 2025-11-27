import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Pin } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { LikeButton } from './LikeButton'
import { formatRelativeTime } from '@/lib/formatDate'
import { PostWithCreator } from '@/hooks/usePosts'
import { cn } from '@/lib/utils'

interface PostCardProps {
  post: PostWithCreator
  showActions?: boolean
  onEdit?: (post: PostWithCreator) => void
  onDelete?: (postId: string) => void
}

export function PostCard({ post, showActions = false, onEdit, onDelete }: PostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const maxContentLength = 300

  const creator = post.profiles
  const shouldTruncate = post.content && post.content.length > maxContentLength
  const displayContent = shouldTruncate && !isExpanded
    ? post.content?.slice(0, maxContentLength) + '...'
    : post.content

  const getInitials = (name: string | null) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card className={cn('relative', post.is_pinned && 'border-primary')}>
      {post.is_pinned && (
        <div className="absolute -top-2 left-4 bg-primary text-primary-foreground px-2 py-0.5 rounded-full flex items-center gap-1 text-xs font-medium">
          <Pin className="h-3 w-3" />
          Pinned
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Link to={`/creator/${creator.username || creator.id}`}>
              <Avatar className="h-10 w-10">
                <AvatarImage src={creator.avatar_url || undefined} alt={creator.full_name || 'Creator'} />
                <AvatarFallback>{getInitials(creator.full_name)}</AvatarFallback>
              </Avatar>
            </Link>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  to={`/creator/${creator.username || creator.id}`}
                  className="font-semibold hover:underline"
                >
                  {creator.full_name || 'Unknown Creator'}
                </Link>
                {creator.username && (
                  <Link
                    to={`/creator/${creator.username}`}
                    className="text-sm text-muted-foreground hover:underline"
                  >
                    @{creator.username}
                  </Link>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <time className="text-xs text-muted-foreground">
                  {formatRelativeTime(post.created_at)}
                </time>
                <Badge variant={post.visibility === 'public' ? 'secondary' : 'default'} className="text-xs">
                  {post.visibility === 'public' ? 'Public' : 'Subscribers Only'}
                </Badge>
              </div>
            </div>
          </div>

          {showActions && onEdit && onDelete && (
            <div className="flex gap-1">
              <button
                onClick={() => onEdit(post)}
                className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-accent"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(post.id)}
                className="text-xs text-destructive hover:text-destructive/90 px-2 py-1 rounded hover:bg-accent"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {post.title && (
          <h3 className="text-lg font-semibold">{post.title}</h3>
        )}

        {post.content && (
          <div className="space-y-2">
            <p className="text-sm whitespace-pre-wrap break-words">{displayContent}</p>
            {shouldTruncate && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-sm text-primary hover:underline"
              >
                {isExpanded ? 'Read less' : 'Read more'}
              </button>
            )}
          </div>
        )}

        {post.media_urls && post.media_urls.length > 0 && (
          <div className={cn(
            'grid gap-2',
            post.media_urls.length === 1 && 'grid-cols-1',
            post.media_urls.length === 2 && 'grid-cols-2',
            post.media_urls.length >= 3 && 'grid-cols-2 md:grid-cols-3'
          )}>
            {post.media_urls.map((url, index) => {
              const isVideo = url.match(/\.(mp4|webm|ogg)$/i)

              if (isVideo) {
                return (
                  <video
                    key={index}
                    src={url}
                    controls
                    className="w-full rounded-lg max-h-96 object-cover"
                  />
                )
              }

              return (
                <img
                  key={index}
                  src={url}
                  alt={`Post media ${index + 1}`}
                  className="w-full rounded-lg object-cover aspect-square"
                />
              )
            })}
          </div>
        )}

        <div className="flex items-center gap-4 pt-2 border-t">
          <LikeButton
            postId={post.id}
            creatorId={post.creator_id}
            initialLikeCount={post.like_count}
            initialIsLiked={post.user_has_liked}
          />

          <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md hover:bg-accent">
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm">{post.comment_count}</span>
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
