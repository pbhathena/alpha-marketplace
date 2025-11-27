import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MainLayout } from '@/components/layout/MainLayout'
import { ProfileHeader } from '@/components/creator/ProfileHeader'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { AlertCircle, Lock } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import type { Profile, CreatorProfile as CreatorProfileType, Post } from '@/types/database'

type CreatorWithProfile = Profile & {
  creator_profile: CreatorProfileType
}

export function CreatorProfile() {
  const { username } = useParams<{ username: string }>()
  const { user } = useAuth()

  // Fetch creator by username
  const { data: creator, isLoading: isLoadingCreator, error: creatorError } = useQuery<CreatorWithProfile | null>({
    queryKey: ['creator', username],
    queryFn: async (): Promise<CreatorWithProfile | null> => {
      if (!username) throw new Error('Username is required')

      // First, find the profile by username (or full_name if username is not set)
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'creator')
        .or(`username.ilike.%${username}%,full_name.ilike.%${username}%`)
        .limit(1)

      if (profileError) throw profileError
      if (!profiles || profiles.length === 0) return null

      const profile = profiles[0] as Profile

      // Fetch creator profile
      const { data: creatorProfile, error: creatorProfileError } = await supabase
        .from('creator_profiles')
        .select('*')
        .eq('user_id', profile.id)
        .single()

      if (creatorProfileError) throw creatorProfileError
      if (!creatorProfile) return null

      return {
        ...profile,
        creator_profile: creatorProfile as CreatorProfileType,
      } as CreatorWithProfile
    },
    enabled: !!username,
  })

  // Check subscription status
  const { data: subscription, isLoading: isLoadingSubscription } = useQuery({
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

      if (error) throw error
      return data
    },
    enabled: !!user && !!creator,
  })

  // Fetch creator's posts
  const { data: posts, isLoading: isLoadingPosts, refetch: refetchPosts } = useQuery({
    queryKey: ['creator-posts', creator?.id, !!subscription],
    queryFn: async () => {
      if (!creator) return []

      const isSubscribed = !!subscription

      let query = supabase
        .from('posts')
        .select('*')
        .eq('creator_id', creator.id)
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false })

      // If not subscribed, only show public posts
      if (!isSubscribed) {
        query = query.eq('visibility', 'public')
      }

      const { data, error } = await query

      if (error) throw error
      return data as Post[]
    },
    enabled: !!creator,
  })

  const isSubscribed = !!subscription
  const isLoading = isLoadingCreator || isLoadingSubscription

  // Loading state
  if (isLoading) {
    return (
      <MainLayout>
        <div className="container px-4 py-8">
          <div className="space-y-4">
            {/* Banner skeleton */}
            <div className="h-48 md:h-64 w-full bg-muted animate-pulse rounded-lg" />

            {/* Profile skeleton */}
            <div className="flex gap-4">
              <div className="h-32 w-32 bg-muted animate-pulse rounded-full" />
              <div className="flex-1 space-y-3">
                <div className="h-8 w-64 bg-muted animate-pulse rounded" />
                <div className="h-4 w-96 bg-muted animate-pulse rounded" />
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              </div>
            </div>

            {/* Content skeleton */}
            <div className="space-y-4 mt-8">
              <div className="h-12 w-full bg-muted animate-pulse rounded" />
              <div className="h-64 w-full bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  // Error or not found
  if (creatorError || !creator) {
    return (
      <MainLayout>
        <div className="container px-4 py-16">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Creator Not Found</AlertTitle>
            <AlertDescription>
              The creator you're looking for doesn't exist or has been removed.
            </AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    )
  }

  const handleSubscriptionChange = () => {
    // Refetch subscription and posts after subscription change
    refetchPosts()
  }

  return (
    <MainLayout>
      <div className="pb-16">
        <ProfileHeader
          creator={creator}
          isSubscribed={isSubscribed}
          onSubscriptionChange={handleSubscriptionChange}
        />

        <div className="container px-4 mt-8">
          <Tabs defaultValue="posts" className="w-full">
            <TabsList>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="mt-6">
              {isLoadingPosts ? (
                <div className="flex justify-center py-12">
                  <Spinner />
                </div>
              ) : posts && posts.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {posts.map((post) => (
                    <Card key={post.id} className="overflow-hidden">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                          {post.visibility !== 'public' && (
                            <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
                          )}
                        </div>
                        <CardDescription>
                          {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {post.content ? `${post.content.substring(0, 150)}...` : 'No content'}
                        </p>
                        <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
                          <span>{post.like_count} likes</span>
                          <span>{post.comment_count} comments</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {isSubscribed
                      ? 'No posts yet. Check back later!'
                      : 'No public posts available. Subscribe to see exclusive content!'}
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="about" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>About {creator.full_name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {creator.creator_profile.bio ? (
                    <p className="text-base leading-relaxed">{creator.creator_profile.bio}</p>
                  ) : (
                    <p className="text-muted-foreground">No bio available.</p>
                  )}

                  <div className="pt-4 border-t">
                    <h3 className="font-semibold mb-2">Stats</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-2xl font-bold">{creator.creator_profile.subscriber_count}</p>
                        <p className="text-sm text-muted-foreground">Subscribers</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">${(creator.creator_profile.subscription_price_cents / 100).toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">Per month</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{posts?.length || 0}</p>
                        <p className="text-sm text-muted-foreground">Posts</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="font-semibold mb-2">Member since</h3>
                    <p className="text-muted-foreground">
                      {new Date(creator.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  )
}
