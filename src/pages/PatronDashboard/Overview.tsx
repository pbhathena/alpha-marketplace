import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Link } from 'react-router-dom'
import { Heart, MessageCircle, CreditCard, Users, Sparkles, Clock, Play, Image as ImageIcon } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

export default function Overview() {
  const { user, profile } = useAuth()

  // Fetch user's active subscriptions
  const { data: subscriptions, isLoading: loadingSubscriptions } = useQuery({
    queryKey: ['my-subscriptions', user?.id],
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          creator:creator_id (
            id,
            full_name,
            username,
            avatar_url
          )
        `)
        .eq('subscriber_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
    enabled: !!user,
  })

  // Fetch latest posts from subscribed creators
  const subscribedCreatorIds = subscriptions?.map((s: any) => s.creator_id) || []
  const { data: latestPosts, isLoading: loadingPosts } = useQuery({
    queryKey: ['subscribed-posts', subscribedCreatorIds],
    queryFn: async () => {
      if (subscribedCreatorIds.length === 0) return []

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
        .in('creator_id', subscribedCreatorIds)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error
      return data || []
    },
    enabled: subscribedCreatorIds.length > 0,
  })

  // Fetch recommended creators (ones the user isn't subscribed to)
  const { data: recommendedCreators } = useQuery({
    queryKey: ['recommended-creators', subscribedCreatorIds],
    queryFn: async () => {
      let query = supabase
        .from('creator_profiles')
        .select(`
          *,
          profile:user_id (
            id,
            full_name,
            username,
            avatar_url
          )
        `)
        .eq('is_active', true)
        .order('subscriber_count', { ascending: false })
        .limit(4)

      // Exclude already-subscribed creators
      if (subscribedCreatorIds.length > 0) {
        query = query.not('user_id', 'in', `(${subscribedCreatorIds.join(',')})`)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    },
    enabled: !!user,
  })

  if (!profile) {
    return null
  }

  const getInitials = (name: string | null) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const stats = [
    {
      title: 'Active Subscriptions',
      value: subscriptions?.length || 0,
      icon: Heart,
      description: 'Creators you support',
    },
    {
      title: 'Messages',
      value: 0,
      icon: MessageCircle,
      description: 'Unread messages',
    },
    {
      title: 'This Month',
      value: '$0.00',
      icon: CreditCard,
      description: 'Total spending',
    },
    {
      title: 'Member Since',
      value: new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      icon: Users,
      description: 'Account created',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold mb-2">
          Welcome back, {profile.full_name || profile.username}!
        </h2>
        <p className="text-muted-foreground">
          Manage your subscriptions and discover new creators
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Active Subscriptions */}
      <Card>
        <CardHeader>
          <CardTitle>Your Subscriptions</CardTitle>
          <CardDescription>
            Creators you're currently supporting
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingSubscriptions ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : subscriptions && subscriptions.length > 0 ? (
            <div className="space-y-4">
              {subscriptions.slice(0, 5).map((sub: any) => (
                <div key={sub.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={sub.creator?.avatar_url} />
                      <AvatarFallback>{getInitials(sub.creator?.full_name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{sub.creator?.full_name}</p>
                      <p className="text-sm text-muted-foreground">@{sub.creator?.username}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {sub.current_period_end
                        ? `Renews ${new Date(sub.current_period_end).toLocaleDateString()}`
                        : 'Active'}
                    </p>
                    <Link to={`/creator/${sub.creator?.username}`}>
                      <Button variant="ghost" size="sm">View Profile</Button>
                    </Link>
                  </div>
                </div>
              ))}
              {subscriptions.length > 5 && (
                <Link to="/my-account/subscriptions">
                  <Button variant="outline" className="w-full">
                    View All ({subscriptions.length})
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No active subscriptions</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Discover creators and subscribe to their exclusive content
              </p>
              <Link to="/explore">
                <Button>Explore Creators</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Latest from Subscriptions */}
      {subscribedCreatorIds.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle>Latest from Your Creators</CardTitle>
            </div>
            <CardDescription>
              New content from creators you subscribe to
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingPosts ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : latestPosts && latestPosts.length > 0 ? (
              <div className="space-y-4">
                {latestPosts.map((post: any) => (
                  <Link
                    key={post.id}
                    to={`/creator/${post.creator?.username}/post/${post.id}`}
                    className="block"
                  >
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={post.creator?.avatar_url} />
                        <AvatarFallback>{getInitials(post.creator?.full_name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{post.creator?.full_name}</span>
                          <span className="text-muted-foreground text-sm">
                            {new Date(post.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="font-medium">{post.title || 'New Post'}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {post.content?.substring(0, 150)}...
                        </p>
                        {post.media_urls?.length > 0 && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                            {post.media_urls[0]?.includes('video') ? (
                              <><Play className="h-3 w-3" /> Video</>
                            ) : (
                              <><ImageIcon className="h-3 w-3" /> {post.media_urls.length} media</>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No new posts from your creators yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recommended Creators */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            <CardTitle>Recommended For You</CardTitle>
          </div>
          <CardDescription>
            Discover new creators you might like
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recommendedCreators && recommendedCreators.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendedCreators.map((creator: any) => (
                <Link
                  key={creator.id}
                  to={`/creator/${creator.profile?.username}`}
                  className="block"
                >
                  <div className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={creator.profile?.avatar_url} />
                      <AvatarFallback>{getInitials(creator.profile?.full_name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">{creator.profile?.full_name}</p>
                      <p className="text-sm text-muted-foreground">@{creator.profile?.username}</p>
                      {creator.tagline && (
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {creator.tagline}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          ${(creator.subscription_price_cents / 100).toFixed(2)}/mo
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {creator.subscriber_count} subscribers
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Link to="/explore">
                <Button>Browse All Creators</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/explore">
            <Button variant="outline" className="w-full h-auto py-4">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">Discover Creators</div>
                  <div className="text-xs text-muted-foreground">Find new alphas to follow</div>
                </div>
              </div>
            </Button>
          </Link>
          <Link to="/my-account/messages">
            <Button variant="outline" className="w-full h-auto py-4">
              <div className="flex items-center gap-3">
                <MessageCircle className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">Messages</div>
                  <div className="text-xs text-muted-foreground">Chat with creators</div>
                </div>
              </div>
            </Button>
          </Link>
          <Link to="/my-account/billing">
            <Button variant="outline" className="w-full h-auto py-4">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">Billing</div>
                  <div className="text-xs text-muted-foreground">Manage payment methods</div>
                </div>
              </div>
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
