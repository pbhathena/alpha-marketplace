import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Users, Heart, Eye, DollarSign, TrendingUp, MessageCircle, FileText, Calendar } from 'lucide-react'

export default function Analytics() {
  const { user, creatorProfile } = useAuth()

  // Fetch analytics data
  const { data: stats, isLoading } = useQuery({
    queryKey: ['creator-analytics', user?.id],
    queryFn: async () => {
      if (!user) return null

      // Get subscriber count
      const subscriberCount = creatorProfile?.subscriber_count || 0

      // Get total posts
      const { count: totalPosts } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', user.id)

      // Get total likes across all posts
      const { data: posts } = await supabase
        .from('posts')
        .select('like_count, comment_count, created_at')
        .eq('creator_id', user.id)

      const totalLikes = posts?.reduce((sum, p) => sum + (p.like_count || 0), 0) || 0
      const totalComments = posts?.reduce((sum, p) => sum + (p.comment_count || 0), 0) || 0

      // Get posts in last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const recentPosts = posts?.filter(p => new Date(p.created_at) > thirtyDaysAgo).length || 0

      // Calculate estimated revenue (subscriber count * price * 0.8 for 80% creator share)
      const pricePerMonth = (creatorProfile?.subscription_price_cents || 0) / 100
      const estimatedMonthlyRevenue = subscriberCount * pricePerMonth * 0.8

      // Get subscription growth (new subs this month)
      const { count: newSubscribersThisMonth } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', user.id)
        .eq('status', 'active')
        .gte('created_at', thirtyDaysAgo.toISOString())

      return {
        subscriberCount,
        totalPosts: totalPosts || 0,
        totalLikes,
        totalComments,
        recentPosts,
        estimatedMonthlyRevenue,
        newSubscribersThisMonth: newSubscribersThisMonth || 0,
        avgEngagement: totalPosts ? Math.round((totalLikes + totalComments) / totalPosts) : 0,
      }
    },
    enabled: !!user,
  })

  // Fetch recent post performance
  const { data: recentPostStats } = useQuery({
    queryKey: ['creator-recent-posts', user?.id],
    queryFn: async () => {
      if (!user) return []

      const { data } = await supabase
        .from('posts')
        .select('id, title, like_count, comment_count, created_at, visibility')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      return data || []
    },
    enabled: !!user,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Subscribers',
      value: stats?.subscriberCount || 0,
      change: `+${stats?.newSubscribersThisMonth || 0} this month`,
      icon: Users,
      color: 'text-blue-500',
    },
    {
      title: 'Monthly Revenue',
      value: `$${(stats?.estimatedMonthlyRevenue || 0).toFixed(2)}`,
      change: 'After 20% platform fee',
      icon: DollarSign,
      color: 'text-green-500',
    },
    {
      title: 'Total Likes',
      value: stats?.totalLikes || 0,
      change: `${stats?.avgEngagement || 0} avg per post`,
      icon: Heart,
      color: 'text-red-500',
    },
    {
      title: 'Total Posts',
      value: stats?.totalPosts || 0,
      change: `${stats?.recentPosts || 0} in last 30 days`,
      icon: FileText,
      color: 'text-purple-500',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Analytics</h2>
        <p className="text-muted-foreground">
          Track your performance and growth
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Engagement Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Post Performance</CardTitle>
            <CardDescription>
              How your latest posts are performing
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentPostStats && recentPostStats.length > 0 ? (
              <div className="space-y-4">
                {recentPostStats.map((post: any) => (
                  <div key={post.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{post.title || 'Untitled'}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString()} · {post.visibility === 'public' ? 'Public' : 'Subscribers'}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {post.like_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {post.comment_count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No posts yet. Create your first post!</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
            <CardDescription>
              Your earnings this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">Gross Revenue</p>
                  <p className="text-sm text-muted-foreground">Before platform fee</p>
                </div>
                <p className="text-2xl font-bold">
                  ${((stats?.subscriberCount || 0) * ((creatorProfile?.subscription_price_cents || 0) / 100)).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-red-500/10">
                <div>
                  <p className="font-medium">Platform Fee (20%)</p>
                  <p className="text-sm text-muted-foreground">Alpha's share</p>
                </div>
                <p className="text-xl font-bold text-red-500">
                  -${((stats?.subscriberCount || 0) * ((creatorProfile?.subscription_price_cents || 0) / 100) * 0.2).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-green-500/10">
                <div>
                  <p className="font-medium">Your Earnings</p>
                  <p className="text-sm text-muted-foreground">Paid to your account</p>
                </div>
                <p className="text-2xl font-bold text-green-500">
                  ${(stats?.estimatedMonthlyRevenue || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Growth Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Growth Tips</CardTitle>
          <CardDescription>
            Suggestions to grow your audience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border">
              <Calendar className="h-8 w-8 text-primary mb-3" />
              <h4 className="font-semibold mb-1">Post Consistently</h4>
              <p className="text-sm text-muted-foreground">
                Aim for at least 2-3 posts per week to keep subscribers engaged.
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <MessageCircle className="h-8 w-8 text-primary mb-3" />
              <h4 className="font-semibold mb-1">Engage with Fans</h4>
              <p className="text-sm text-muted-foreground">
                Reply to comments and messages to build a loyal community.
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <Eye className="h-8 w-8 text-primary mb-3" />
              <h4 className="font-semibold mb-1">Share Public Content</h4>
              <p className="text-sm text-muted-foreground">
                Post some public content to attract new potential subscribers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
