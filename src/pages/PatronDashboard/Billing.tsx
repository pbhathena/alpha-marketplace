import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Receipt, ExternalLink, AlertCircle } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function Billing() {
  const { user } = useAuth()

  // Fetch subscriptions for billing info
  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['billing-subscriptions', user?.id],
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          creator:creator_id (
            id,
            full_name,
            username
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

  // Calculate monthly spending (placeholder - would come from Stripe in production)
  const monthlySpending = subscriptions?.reduce((total: number, sub: any) => {
    // In production, this would come from actual subscription prices
    return total + 29.99 // Placeholder price
  }, 0) || 0

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
        <h2 className="text-3xl font-bold mb-2">Billing</h2>
        <p className="text-muted-foreground">
          Manage your payment methods and view billing history
        </p>
      </div>

      {/* Billing Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Spending</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${monthlySpending.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {subscriptions?.length || 0} active subscription{subscriptions?.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Billing Date</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {subscriptions && subscriptions.length > 0 && subscriptions[0].current_period_end
                ? new Date(subscriptions[0].current_period_end).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Subscriptions renew automatically
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>
            Manage your payment methods for subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Stripe Integration</AlertTitle>
            <AlertDescription>
              Payment methods are managed through Stripe's secure portal. Click below to manage your payment details.
            </AlertDescription>
          </Alert>

          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            <Button variant="outline" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Add Payment Method
              <ExternalLink className="h-3 w-3" />
            </Button>
            <Button variant="ghost" className="flex items-center gap-2">
              Manage in Stripe
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            View your past transactions and download invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscriptions && subscriptions.length > 0 ? (
            <div className="space-y-4">
              {/* Placeholder billing entries */}
              {subscriptions.map((sub: any, index: number) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div>
                    <p className="font-medium">Subscription to {sub.creator?.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(sub.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">$29.99</p>
                    <Badge variant="secondary">Paid</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No billing history yet</p>
              <p className="text-sm">Your transactions will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Billing FAQ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-1">When am I charged?</h4>
            <p className="text-sm text-muted-foreground">
              You're charged immediately when you subscribe to a creator, then monthly on the same date.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Can I get a refund?</h4>
            <p className="text-sm text-muted-foreground">
              Refunds are handled on a case-by-case basis. Contact support for assistance.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">How do I cancel?</h4>
            <p className="text-sm text-muted-foreground">
              You can cancel any subscription from the My Subscriptions page. You'll retain access until the end of your billing period.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
