import { useState, useEffect } from 'react'
import { CreatePostForm } from '@/components/feed/CreatePostForm'
import { PostFeed } from '@/components/feed/PostFeed'
import { usePosts, useDeletePost, useUpdatePost, PostWithCreator } from '@/hooks/usePosts'
import { supabase } from '@/integrations/supabase/client'
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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

export default function Posts() {
  const [creatorId, setCreatorId] = useState<string | null>(null)
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | PostVisibility>('all')
  const [postToDelete, setPostToDelete] = useState<string | null>(null)
  const [postToEdit, setPostToEdit] = useState<PostWithCreator | null>(null)

  // Edit form state
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editVisibility, setEditVisibility] = useState<PostVisibility>('public')
  const [editIsPinned, setEditIsPinned] = useState(false)

  const { data: posts, isLoading } = usePosts(creatorId || '')
  const deletePostMutation = useDeletePost()
  const updatePostMutation = useUpdatePost()

  // Populate edit form when postToEdit changes
  useEffect(() => {
    if (postToEdit) {
      setEditTitle(postToEdit.title || '')
      setEditContent(postToEdit.content || '')
      setEditVisibility(postToEdit.visibility)
      setEditIsPinned(postToEdit.is_pinned)
    }
  }, [postToEdit])

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

  const handleEditSave = async () => {
    if (!postToEdit || !creatorId) return

    try {
      await updatePostMutation.mutateAsync({
        creatorId,
        data: {
          id: postToEdit.id,
          title: editTitle.trim(),
          content: editContent.trim() || null,
          visibility: editVisibility,
          is_pinned: editIsPinned,
        },
      })
      setPostToEdit(null)
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

      {/* Edit Post Dialog */}
      <Dialog open={!!postToEdit} onOpenChange={() => setPostToEdit(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription>
              Make changes to your post below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Post title..."
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="What's on your mind?"
                className="min-h-[200px]"
                maxLength={5000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {editContent.length} / 5000
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="edit-visibility">Visibility:</Label>
                <select
                  id="edit-visibility"
                  value={editVisibility}
                  onChange={(e) => setEditVisibility(e.target.value as PostVisibility)}
                  className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="public">Public</option>
                  <option value="subscribers_only">Subscribers Only</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-pinned"
                  checked={editIsPinned}
                  onChange={(e) => setEditIsPinned(e.target.checked)}
                  className="h-4 w-4 rounded border-input"
                />
                <Label htmlFor="edit-pinned" className="cursor-pointer">
                  Pin this post
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPostToEdit(null)}
              disabled={updatePostMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditSave}
              disabled={updatePostMutation.isPending}
            >
              {updatePostMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
