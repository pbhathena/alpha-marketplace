import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingUp, Users, CreditCard } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

export default function Revenue() {
  // Fetch revenue data
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-revenue'],
    queryFn: async () => {
      // Get active subscriptions with creator prices
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select(`
          *,
          creator:creator_id (
            id
          )
        `)
        .eq('status', 'active')

      // Get creator prices
      const { data: creatorProfiles } = await supabase
        .from('creator_profiles')
        .select('user_id, subscription_price_cents')

      // Calculate MRR
      const priceMap = new Map()
      creatorProfiles?.forEach((p: any) => {
        priceMap.set(p.user_id, p.subscription_price_cents)
      })

      let mrr = 0
      subscriptions?.forEach((sub: any) => {
        const price = priceMap.get(sub.creator_id) || 0
        mrr += price
      })

      const platformFee = 0.20 // 20%
      const platformRevenue = mrr * platformFee
      const creatorPayouts = mrr - platformRevenue

      return {
        totalMrr: mrr / 100,
        platformRevenue: platformRevenue / 100,
        creatorPayouts: creatorPayouts / 100,
        activeSubscriptions: subscriptions?.length || 0,
        avgSubscriptionValue: subscriptions?.length ? (mrr / subscriptions.length / 100) : 0,
      }
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    )
  }

  const revenueCards = [
    {
      title: 'Monthly Recurring Revenue',
      value: `$${stats?.totalMrr.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      description: 'Total subscription revenue',
    },
    {
      title: 'Platform Revenue',
      value: `$${stats?.platformRevenue.toFixed(2) || '0.00'}`,
      icon: TrendingUp,
      description: '20% platform fee',
    },
    {
      title: 'Creator Payouts',
      value: `$${stats?.creatorPayouts.toFixed(2) || '0.00'}`,
      icon: CreditCard,
      description: '80% to creators',
    },
    {
      title: 'Avg. Subscription',
      value: `$${stats?.avgSubscriptionValue.toFixed(2) || '0.00'}`,
      icon: Users,
      description: 'Per subscriber',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Revenue</h2>
        <p className="text-muted-foreground">
          Platform revenue and financial metrics
        </p>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {revenueCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
            <CardDescription>How revenue is distributed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">Gross Revenue</p>
                  <p className="text-sm text-muted-foreground">Total subscription payments</p>
                </div>
                <p className="text-2xl font-bold">${stats?.totalMrr.toFixed(2) || '0.00'}</p>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10">
                <div>
                  <p className="font-medium">Platform Fee (20%)</p>
                  <p className="text-sm text-muted-foreground">Alpha's share</p>
                </div>
                <p className="text-2xl font-bold text-primary">${stats?.platformRevenue.toFixed(2) || '0.00'}</p>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-green-500/10">
                <div>
                  <p className="font-medium">Creator Earnings (80%)</p>
                  <p className="text-sm text-muted-foreground">Paid to creators</p>
                </div>
                <p className="text-2xl font-bold text-green-500">${stats?.creatorPayouts.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payout Schedule</CardTitle>
            <CardDescription>Upcoming creator payouts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Payouts are processed through Stripe Connect</p>
                <p className="text-sm mt-2">Creators receive funds directly to their connected accounts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Earners */}
      <Card>
        <CardHeader>
          <CardTitle>Top Earning Creators</CardTitle>
          <CardDescription>Creators with highest subscription revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Revenue analytics will be available once subscriptions are active</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
