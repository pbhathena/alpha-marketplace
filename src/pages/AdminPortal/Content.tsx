import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Search, MoreHorizontal, Eye, Trash2, Flag, ExternalLink } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'

export default function Content() {
  const [search, setSearch] = useState('')
  const [visibilityFilter, setVisibilityFilter] = useState<string>('all')
  const queryClient = useQueryClient()

  // Fetch posts with creator info
  const { data: posts, isLoading } = useQuery({
    queryKey: ['admin-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          creator:creator_id (
            id,
            full_name,
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error
      return data || []
    },
  })

  // Delete post mutation
  const deletePost = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] })
      toast.success('Post deleted')
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete: ${error.message}`)
    },
  })

  const filteredPosts = posts?.filter((post: any) => {
    // Visibility filter
    if (visibilityFilter !== 'all' && post.visibility !== visibilityFilter) return false

    // Search filter
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      post.title?.toLowerCase().includes(searchLower) ||
      post.content?.toLowerCase().includes(searchLower) ||
      post.creator?.full_name?.toLowerCase().includes(searchLower) ||
      post.creator?.username?.toLowerCase().includes(searchLower)
    )
  })

  const getInitials = (name: string | null) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Content</h2>
        <p className="text-muted-foreground">
          Moderate and manage platform content
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'All' },
                { value: 'public', label: 'Public' },
                { value: 'subscribers_only', label: 'Subscribers Only' },
              ].map((filter) => (
                <Button
                  key={filter.value}
                  variant={visibilityFilter === filter.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setVisibilityFilter(filter.value)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Posts ({filteredPosts?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Post</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Engagement</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosts && filteredPosts.length > 0 ? (
                filteredPosts.map((post: any) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div className="max-w-[300px]">
                        <p className="font-medium truncate">{post.title || 'Untitled'}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {post.content?.substring(0, 100) || 'No content'}
                        </p>
                        {post.media_urls?.length > 0 && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            {post.media_urls.length} media
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={post.creator?.avatar_url || undefined} />
                          <AvatarFallback>{getInitials(post.creator?.full_name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{post.creator?.full_name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">@{post.creator?.username}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={post.visibility === 'public' ? 'secondary' : 'default'}>
                        {post.visibility === 'public' ? 'Public' : 'Subscribers'}
                      </Badge>
                      {post.is_pinned && (
                        <Badge variant="outline" className="ml-1">Pinned</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{post.like_count} likes</p>
                        <p className="text-muted-foreground">{post.comment_count} comments</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(post.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/creator/${post.creator?.username}/post/${post.id}`} target="_blank">
                              <Eye className="mr-2 h-4 w-4" />
                              View Post
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Flag className="mr-2 h-4 w-4" />
                            Flag for Review
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              if (confirm('Delete this post?')) {
                                deletePost.mutate(post.id)
                              }
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Post
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No posts found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
