import { PostCard } from './PostCard'
import { PostWithCreator } from '@/hooks/usePosts'

interface PostFeedProps {
  posts: PostWithCreator[]
  isLoading?: boolean
  showActions?: boolean
  onEdit?: (post: PostWithCreator) => void
  onDelete?: (postId: string) => void
  emptyMessage?: string
}

export function PostFeed({
  posts,
  isLoading = false,
  showActions = false,
  onEdit,
  onDelete,
  emptyMessage = 'No posts yet'
}: PostFeedProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border bg-card p-6 animate-pulse">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-32" />
                <div className="h-3 bg-muted rounded w-24" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-5/6" />
              <div className="h-4 bg-muted rounded w-4/6" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
          <svg
            className="w-6 h-6 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
            />
          </svg>
        </div>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  // Separate pinned and regular posts
  const pinnedPosts = posts.filter(post => post.is_pinned)
  const regularPosts = posts.filter(post => !post.is_pinned)

  return (
    <div className="space-y-4">
      {pinnedPosts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          showActions={showActions}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}

      {regularPosts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          showActions={showActions}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
