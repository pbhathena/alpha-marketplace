import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MainLayout } from '@/components/layout/MainLayout'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { AlertCircle, Lock, Heart, MessageCircle, Share2, ArrowLeft, Play } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import type { Post } from '@/types/database'
import { isDemoCreator, getDemoPostsByCreator, getDemoCreatorProfile } from '@/data/demoContent'

export function PostDetail() {
  const { username, postId } = useParams<{ username: string; postId: string }>()
  const { user, isDemoMode } = useAuth()

  const isViewingDemoCreator = username ? isDemoCreator(username) : false

  // Fetch creator profile
  const { data: creator, isLoading: isLoadingCreator } = useQuery({
    queryKey: ['creator', username, isViewingDemoCreator],
    queryFn: async () => {
      if (!username) return null

      if (isViewingDemoCreator) {
        const demoData = getDemoCreatorProfile(username)
        if (demoData) {
          return {
            ...demoData.profile,
            creator_profile: demoData.creatorProfile,
          }
        }
        return null
      }

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*, creator_profiles(*)')
        .eq('role', 'creator')
        .or(`username.ilike.%${username}%,full_name.ilike.%${username}%`)
        .limit(1)

      if (error || !profiles || profiles.length === 0) return null
      return profiles[0]
    },
    enabled: !!username,
  })

  // Fetch subscription status
  const { data: subscription } = useQuery({
    queryKey: ['subscription', creator?.id, user?.id],
    queryFn: async () => {
      if (!user || !creator) return null

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('subscriber_id', user.id)
        .eq('creator_id', creator.id)
        .eq('status', 'active')
        .maybeSingle()

      if (error) return null
      return data
    },
    enabled: !!user && !!creator && !isViewingDemoCreator,
  })

  const isSubscribed = isViewingDemoCreator ? isDemoMode : !!subscription

  // Fetch post
  const { data: post, isLoading: isLoadingPost, error: postError } = useQuery<Post | null>({
    queryKey: ['post', postId, username, isSubscribed],
    queryFn: async () => {
      if (!postId || !username) return null

      if (isViewingDemoCreator) {
        const posts = getDemoPostsByCreator(username, isSubscribed)
        return posts.find(p => p.id === postId) || null
      }

      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single()

      if (error) return null
      return data as Post
    },
    enabled: !!postId && !!username,
  })

  const isLoading = isLoadingCreator || isLoadingPost

  const getInitials = (name: string | null) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Loading state
  if (isLoading) {
    return (
      <MainLayout>
        <div className="container max-w-4xl px-4 py-8">
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        </div>
      </MainLayout>
    )
  }

  // Error or not found
  if (postError || !post || !creator) {
    return (
      <MainLayout>
        <div className="container max-w-4xl px-4 py-16">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Post Not Found</AlertTitle>
            <AlertDescription>
              The post you're looking for doesn't exist or has been removed.
            </AlertDescription>
          </Alert>
          <div className="mt-6">
            <Link to={username ? `/creator/${username}` : '/explore'}>
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to {username ? 'Profile' : 'Explore'}
              </Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    )
  }

  // Check if post is locked
  const isLocked = post.visibility !== 'public' && !isSubscribed

  return (
    <MainLayout>
      <div className="container max-w-4xl px-4 py-8">
        {/* Back button */}
        <Link to={`/creator/${username}`} className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to {creator.full_name}'s profile
        </Link>

        <Card className="overflow-hidden">
          {/* Creator header */}
          <CardHeader className="border-b">
            <div className="flex items-center gap-4">
              <Link to={`/creator/${username}`}>
                <Avatar className="h-12 w-12">
                  <AvatarImage src={creator.avatar_url || undefined} alt={creator.full_name || 'Creator'} />
                  <AvatarFallback>{getInitials(creator.full_name)}</AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1">
                <Link to={`/creator/${username}`} className="font-semibold hover:underline">
                  {creator.full_name || 'Unknown Creator'}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <time className="text-sm text-muted-foreground">
                    {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                  <Badge variant={post.visibility === 'public' ? 'secondary' : 'default'}>
                    {post.visibility === 'public' ? 'Public' : 'Subscribers Only'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isLocked ? (
              /* Locked content placeholder */
              <div className="relative">
                {/* Blurred placeholder */}
                <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <div className="absolute inset-0 backdrop-blur-xl bg-black/60" />
                  <div className="relative z-10 text-center p-8">
                    <div className="rounded-full bg-primary/20 p-6 inline-block mb-4">
                      <Lock className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Subscriber-Only Content</h3>
                    <p className="text-gray-400 mb-6 max-w-md">
                      Subscribe to {creator.full_name} to unlock this exclusive content and more.
                    </p>
                    <Link to={`/creator/${username}`}>
                      <Button size="lg">
                        Subscribe to Unlock
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Title shown even when locked */}
                <div className="p-6">
                  <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
                  <p className="text-muted-foreground">Subscribe to view the full content...</p>
                </div>
              </div>
            ) : (
              /* Unlocked content */
              <>
                {/* Video/Media placeholder */}
                {post.media_urls && post.media_urls.length > 0 ? (
                  <div className="relative aspect-video bg-black flex items-center justify-center group cursor-pointer">
                    {/* Video thumbnail */}
                    <img
                      src={post.media_urls[0]}
                      alt={post.title || 'Post media'}
                      className="w-full h-full object-cover"
                    />
                    {/* Play button overlay - simulates video */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                      <div className="rounded-full bg-primary/90 p-5 transform group-hover:scale-110 transition-transform">
                        <Play className="h-10 w-10 text-white fill-white" />
                      </div>
                    </div>
                    {/* Video duration placeholder */}
                    <div className="absolute bottom-4 right-4 bg-black/80 px-2 py-1 rounded text-sm text-white">
                      12:45
                    </div>
                  </div>
                ) : (
                  /* No media - show default video placeholder */
                  <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center group cursor-pointer">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="rounded-full bg-primary/90 p-5 transform group-hover:scale-110 transition-transform">
                        <Play className="h-10 w-10 text-white fill-white" />
                      </div>
                    </div>
                    <div className="absolute bottom-4 right-4 bg-black/80 px-2 py-1 rounded text-sm text-white">
                      8:32
                    </div>
                  </div>
                )}

                {/* Post content */}
                <div className="p-6">
                  <h1 className="text-2xl font-bold mb-4">{post.title}</h1>

                  {post.content && (
                    <div className="prose prose-invert max-w-none">
                      <p className="whitespace-pre-wrap text-foreground/90 leading-relaxed">
                        {post.content}
                      </p>
                    </div>
                  )}

                  {/* Additional media gallery */}
                  {post.media_urls && post.media_urls.length > 1 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                      {post.media_urls.slice(1).map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Media ${index + 2}`}
                          className="w-full rounded-lg object-cover aspect-square"
                        />
                      ))}
                    </div>
                  )}

                  {/* Engagement stats */}
                  <div className="flex items-center gap-6 mt-8 pt-6 border-t">
                    <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                      <Heart className="h-5 w-5" />
                      <span>{post.like_count} likes</span>
                    </button>
                    <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                      <MessageCircle className="h-5 w-5" />
                      <span>{post.comment_count} comments</span>
                    </button>
                    <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors ml-auto">
                      <Share2 className="h-5 w-5" />
                      <span>Share</span>
                    </button>
                  </div>

                  {/* Comments placeholder */}
                  <div className="mt-8 pt-6 border-t">
                    <h3 className="font-semibold mb-4">Comments ({post.comment_count})</h3>
                    <div className="space-y-4">
                      <div className="flex gap-3 p-4 rounded-lg bg-muted/50">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">John D.</span>
                            <span className="text-xs text-muted-foreground">2 days ago</span>
                          </div>
                          <p className="text-sm mt-1">Great content! Really appreciate the detailed breakdown.</p>
                        </div>
                      </div>
                      <div className="flex gap-3 p-4 rounded-lg bg-muted/50">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>SM</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">Sarah M.</span>
                            <span className="text-xs text-muted-foreground">1 day ago</span>
                          </div>
                          <p className="text-sm mt-1">This is exactly what I needed. Thanks for sharing!</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
