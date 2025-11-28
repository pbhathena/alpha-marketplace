import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserCheck, DollarSign, FileText, TrendingUp, TrendingDown, CreditCard, Flag, Settings, MessageSquare } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  // Fetch platform stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      // Get total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Get total creators
      const { count: totalCreators } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'creator')

      // Get active subscriptions
      const { count: activeSubscriptions } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      // Get total posts
      const { count: totalPosts } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })

      // Get recent signups (last 7 days)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const { count: recentSignups } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString())

      // Get recent creators (last 7 days)
      const { count: recentCreators } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'creator')
        .gte('created_at', weekAgo.toISOString())

      return {
        totalUsers: totalUsers || 0,
        totalCreators: totalCreators || 0,
        activeSubscriptions: activeSubscriptions || 0,
        totalPosts: totalPosts || 0,
        recentSignups: recentSignups || 0,
        recentCreators: recentCreators || 0,
      }
    },
  })

  // Fetch recent activity
  const { data: recentUsers } = useQuery({
    queryKey: ['admin-recent-users'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      return data || []
    },
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
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      description: `+${stats?.recentSignups || 0} this week`,
      trend: 'up',
    },
    {
      title: 'Creators',
      value: stats?.totalCreators || 0,
      icon: UserCheck,
      description: `+${stats?.recentCreators || 0} this week`,
      trend: 'up',
    },
    {
      title: 'Active Subscriptions',
      value: stats?.activeSubscriptions || 0,
      icon: DollarSign,
      description: 'Recurring revenue source',
      trend: 'up',
    },
    {
      title: 'Total Posts',
      value: stats?.totalPosts || 0,
      icon: FileText,
      description: 'Content published',
      trend: 'up',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
        <p className="text-muted-foreground">
          Platform overview and key metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown

          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <TrendIcon className={`h-3 w-3 ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Signups</CardTitle>
            <CardDescription>
              Newest users on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentUsers && recentUsers.length > 0 ? (
              <div className="space-y-4">
                {recentUsers.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                        ) : (
                          <span className="text-sm font-medium">
                            {(user.full_name || user.email)?.[0]?.toUpperCase() || '?'}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{user.full_name || user.email}</p>
                        <p className="text-sm text-muted-foreground">@{user.username || 'no-username'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        user.role === 'creator'
                          ? 'bg-primary/10 text-primary'
                          : user.role === 'admin'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-muted'
                      }`}>
                        {user.role}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No recent signups</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/admin/creators" className="block">
              <div className="p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors flex items-center gap-3">
                <UserCheck className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-medium">Manage Creators</h4>
                  <p className="text-sm text-muted-foreground">Review and manage creator accounts</p>
                </div>
              </div>
            </Link>
            <Link to="/admin/content" className="block">
              <div className="p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors flex items-center gap-3">
                <Flag className="h-5 w-5 text-orange-500" />
                <div>
                  <h4 className="font-medium">Content Moderation</h4>
                  <p className="text-sm text-muted-foreground">Review and moderate posts</p>
                </div>
              </div>
            </Link>
            <Link to="/admin/revenue" className="block">
              <div className="p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-green-500" />
                <div>
                  <h4 className="font-medium">Revenue & Payouts</h4>
                  <p className="text-sm text-muted-foreground">View revenue and manage payouts</p>
                </div>
              </div>
            </Link>
            <Link to="/admin/settings" className="block">
              <div className="p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors flex items-center gap-3">
                <Settings className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h4 className="font-medium">Platform Settings</h4>
                  <p className="text-sm text-muted-foreground">Configure platform behavior</p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
