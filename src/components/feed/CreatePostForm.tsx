import { useState, useRef, useEffect } from 'react'
import { X, Loader2, Image as ImageIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useCreatePost, useUploadPostMedia } from '@/hooks/usePosts'
import { PostVisibility } from '@/types/database'
import { toast } from 'sonner'

interface CreatePostFormProps {
  creatorId: string
  onSuccess?: () => void
}

export function CreatePostForm({ creatorId, onSuccess }: CreatePostFormProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [visibility, setVisibility] = useState<PostVisibility>('public')
  const [isPinned, setIsPinned] = useState(false)
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const createPostMutation = useCreatePost()
  const uploadMediaMutation = useUploadPostMedia()

  const maxCharacters = 5000
  const characterCount = content.length

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [content])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Limit to 4 images
    const remainingSlots = 4 - mediaFiles.length
    const filesToAdd = files.slice(0, remainingSlots)

    // Validate file types
    const validFiles = filesToAdd.filter(file => {
      const isImage = file.type.startsWith('image/')
      const isVideo = file.type.startsWith('video/')
      if (!isImage && !isVideo) {
        toast.error(`${file.name} is not a valid image or video file`)
        return false
      }
      // Limit file size to 10MB
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`)
        return false
      }
      return true
    })

    setMediaFiles(prev => [...prev, ...validFiles])

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setMediaPreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index))
    setMediaPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() && !content.trim() && mediaFiles.length === 0) {
      toast.error('Please add a title, content, or media')
      return
    }

    try {
      // Upload media files
      const mediaUrls: string[] = []
      for (const file of mediaFiles) {
        const url = await uploadMediaMutation.mutateAsync({ file, creatorId })
        mediaUrls.push(url)
      }

      // Create post
      await createPostMutation.mutateAsync({
        creatorId,
        data: {
          title: title.trim(),
          content: content.trim() || null,
          media_urls: mediaUrls,
          visibility,
          is_pinned: isPinned,
        },
      })

      // Reset form
      setTitle('')
      setContent('')
      setMediaFiles([])
      setMediaPreviews([])
      setVisibility('public')
      setIsPinned(false)

      onSuccess?.()
    } catch (error) {
      // Error handling is done in the mutations
    }
  }

  const isSubmitting = createPostMutation.isPending || uploadMediaMutation.isPending

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Post</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your post a title..."
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">Content</Label>
              <span className="text-xs text-muted-foreground">
                {characterCount} / {maxCharacters}
              </span>
            </div>
            <Textarea
              ref={textareaRef}
              id="content"
              value={content}
              onChange={(e) => {
                if (e.target.value.length <= maxCharacters) {
                  setContent(e.target.value)
                }
              }}
              placeholder="What's on your mind?"
              className="min-h-[120px] resize-none"
              rows={4}
            />
          </div>

          {mediaPreviews.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {mediaPreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Upload preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeMedia(index)}
                    className="absolute top-2 right-2 p-1 bg-black/70 rounded-full text-white hover:bg-black transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                id="media"
                accept="image/*,video/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                disabled={mediaFiles.length >= 4}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={mediaFiles.length >= 4}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Add Media ({mediaFiles.length}/4)
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="visibility" className="text-sm">Visibility:</Label>
              <select
                id="visibility"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as PostVisibility)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="public">Public</option>
                <option value="subscribers_only">Subscribers Only</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="pinned"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="pinned" className="text-sm cursor-pointer">
                Pin this post
              </Label>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {uploadMediaMutation.isPending ? 'Uploading...' : 'Posting...'}
                </>
              ) : (
                'Publish Post'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
