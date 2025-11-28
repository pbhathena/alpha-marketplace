import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Link } from 'react-router-dom'
import { Heart, Calendar, AlertCircle, Loader2 } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'

export default function Subscriptions() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [subscriptionToCancel, setSubscriptionToCancel] = useState<any>(null)

  // Fetch all subscriptions (active and canceled)
  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['all-subscriptions', user?.id],
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
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
    enabled: !!user,
  })

  // Cancel subscription mutation
  const cancelMutation = useMutation({
    mutationFn: async (subscriptionId: string) => {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          canceled_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['my-subscriptions'] })
      toast.success('Subscription canceled successfully')
      setCancelDialogOpen(false)
      setSubscriptionToCancel(null)
    },
    onError: (error: Error) => {
      toast.error(`Failed to cancel: ${error.message}`)
    },
  })

  const activeSubscriptions = subscriptions?.filter((s: any) => s.status === 'active') || []
  const canceledSubscriptions = subscriptions?.filter((s: any) => s.status === 'canceled') || []

  const getInitials = (name: string | null) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleCancelClick = (subscription: any) => {
    setSubscriptionToCancel(subscription)
    setCancelDialogOpen(true)
  }

  const handleConfirmCancel = () => {
    if (subscriptionToCancel) {
      cancelMutation.mutate(subscriptionToCancel.id)
    }
  }

  const SubscriptionCard = ({ subscription, showCancel = false }: { subscription: any; showCancel?: boolean }) => (
    <Card key={subscription.id}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Link to={`/creator/${subscription.creator?.username}`}>
              <Avatar className="h-16 w-16">
                <AvatarImage src={subscription.creator?.avatar_url} />
                <AvatarFallback>{getInitials(subscription.creator?.full_name)}</AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <Link to={`/creator/${subscription.creator?.username}`} className="hover:underline">
                <h3 className="font-semibold text-lg">{subscription.creator?.full_name}</h3>
              </Link>
              <p className="text-sm text-muted-foreground">@{subscription.creator?.username}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                  {subscription.status}
                </Badge>
                {subscription.current_period_end && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {subscription.status === 'active' ? 'Renews' : 'Ended'}{' '}
                    {new Date(subscription.current_period_end).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Link to={`/creator/${subscription.creator?.username}`}>
              <Button variant="outline" size="sm">View Profile</Button>
            </Link>
            {showCancel && subscription.status === 'active' && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => handleCancelClick(subscription)}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

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
        <h2 className="text-3xl font-bold mb-2">My Subscriptions</h2>
        <p className="text-muted-foreground">
          Manage your creator subscriptions
        </p>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">
            Active ({activeSubscriptions.length})
          </TabsTrigger>
          <TabsTrigger value="canceled">
            Canceled ({canceledSubscriptions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {activeSubscriptions.length > 0 ? (
            <div className="space-y-4">
              {activeSubscriptions.map((sub: any) => (
                <SubscriptionCard key={sub.id} subscription={sub} showCancel />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No active subscriptions</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Find creators you love and subscribe to their exclusive content
                </p>
                <Link to="/explore">
                  <Button>Explore Creators</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="canceled" className="mt-6">
          {canceledSubscriptions.length > 0 ? (
            <div className="space-y-4">
              {canceledSubscriptions.map((sub: any) => (
                <SubscriptionCard key={sub.id} subscription={sub} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No canceled subscriptions</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Cancel Subscription
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your subscription to{' '}
              <strong>{subscriptionToCancel?.creator?.full_name}</strong>?
              You will lose access to their subscriber-only content.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              disabled={cancelMutation.isPending}
            >
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmCancel}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Canceling...
                </>
              ) : (
                'Yes, Cancel'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
