import { useState, useEffect } from 'react'
import { CreatePostForm } from '@/components/feed/CreatePostForm'
import { PostFeed } from '@/components/feed/PostFeed'
import { usePosts, useDeletePost, PostWithCreator } from '@/hooks/usePosts'
import { supabase } from '@/lib/supabase'
import { PostVisibility } from '@/types/database'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export default function Posts() {
  const [creatorId, setCreatorId] = useState<string | null>(null)
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | PostVisibility>('all')
  const [postToDelete, setPostToDelete] = useState<string | null>(null)
  const [postToEdit, setPostToEdit] = useState<PostWithCreator | null>(null)

  const { data: posts, isLoading } = usePosts(creatorId || '')
  const deletePostMutation = useDeletePost()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setCreatorId(user.id)
      }
    })
  }, [])

  const handleDeleteConfirm = async () => {
    if (!postToDelete || !creatorId) return

    try {
      await deletePostMutation.mutateAsync({ creatorId, postId: postToDelete })
      setPostToDelete(null)
    } catch (error) {
      // Error handling is done in the mutation
    }
  }

  const filteredPosts = posts?.filter(post => {
    if (visibilityFilter === 'all') return true
    return post.visibility === visibilityFilter
  }) || []

  if (!creatorId) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Posts</h1>
        <p className="text-muted-foreground">
          Create and manage your posts to engage with your subscribers
        </p>
      </div>

      <CreatePostForm creatorId={creatorId} />

      <div>
        <Tabs value={visibilityFilter} onValueChange={(value) => setVisibilityFilter(value as typeof visibilityFilter)}>
          <TabsList>
            <TabsTrigger value="all">All Posts</TabsTrigger>
            <TabsTrigger value="public">Public</TabsTrigger>
            <TabsTrigger value="subscribers_only">Subscribers Only</TabsTrigger>
          </TabsList>

          <TabsContent value={visibilityFilter} className="mt-6">
            <PostFeed
              posts={filteredPosts}
              isLoading={isLoading}
              showActions={true}
              onEdit={setPostToEdit}
              onDelete={setPostToDelete}
              emptyMessage={
                visibilityFilter === 'all'
                  ? 'No posts yet. Create your first post above!'
                  : `No ${visibilityFilter === 'public' ? 'public' : 'subscriber-only'} posts yet.`
              }
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!postToDelete} onOpenChange={() => setPostToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPostToDelete(null)}
              disabled={deletePostMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deletePostMutation.isPending}
            >
              {deletePostMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Post Dialog - Placeholder for now */}
      <Dialog open={!!postToEdit} onOpenChange={() => setPostToEdit(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription>
              Edit functionality coming soon. For now, you can delete and recreate the post.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setPostToEdit(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
