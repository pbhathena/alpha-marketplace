import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, CheckCircle2, AlertCircle, ExternalLink, CreditCard } from 'lucide-react'
import { toast } from 'sonner'

export default function StripeSetup() {
  const { user, creatorProfile, refreshProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)

  useEffect(() => {
    // Check if returning from Stripe
    const urlParams = new URLSearchParams(window.location.search)
    const refreshParam = urlParams.get('refresh')

    if (refreshParam === 'true') {
      checkStripeStatus()
      // Clean up URL
      window.history.replaceState({}, '', '/dashboard/stripe-setup')
    }
  }, [])

  const checkStripeStatus = async () => {
    setIsCheckingStatus(true)
    try {
      await refreshProfile()

      if (creatorProfile?.stripe_onboarding_complete) {
        toast.success('Stripe account connected successfully!')
      }
    } catch (error) {
      console.error('Error checking Stripe status:', error)
    } finally {
      setIsCheckingStatus(false)
    }
  }

  const startStripeOnboarding = async () => {
    if (!user) return

    setIsLoading(true)

    try {
      // Call edge function to create Stripe Connect account and get onboarding URL
      const { data, error } = await supabase.functions.invoke('create-stripe-connect', {
        body: { userId: user.id }
      })

      if (error) throw error

      if (data?.url) {
        // Redirect to Stripe onboarding
        window.location.href = data.url
      } else {
        throw new Error('No onboarding URL received')
      }
    } catch (error: any) {
      console.error('Error starting Stripe onboarding:', error)
      toast.error(error.message || 'Failed to start Stripe onboarding')

      // Fallback: show instructions for manual setup
      toast.error('Please contact support to complete your Stripe setup')
    } finally {
      setIsLoading(false)
    }
  }

  const manageDashboard = async () => {
    if (!user) return

    setIsLoading(true)

    try {
      // Call edge function to get Stripe dashboard link
      const { data, error } = await supabase.functions.invoke('get-stripe-dashboard', {
        body: { userId: user.id }
      })

      if (error) throw error

      if (data?.url) {
        window.open(data.url, '_blank')
      } else {
        throw new Error('No dashboard URL received')
      }
    } catch (error: any) {
      console.error('Error getting Stripe dashboard:', error)
      toast.error(error.message || 'Failed to access Stripe dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  if (!creatorProfile) {
    return null
  }

  const isConnected = creatorProfile.stripe_onboarding_complete

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Stripe Connect</h2>
        <p className="text-muted-foreground">
          Connect your Stripe account to receive payments from subscribers
        </p>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Account Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isCheckingStatus ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking status...
            </div>
          ) : isConnected ? (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Connected</AlertTitle>
              <AlertDescription className="text-green-700">
                Your Stripe account is connected and ready to receive payments.
                {creatorProfile.stripe_account_id && (
                  <p className="mt-2 text-sm">
                    Account ID: {creatorProfile.stripe_account_id.substring(0, 20)}...
                  </p>
                )}
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Not Connected</AlertTitle>
              <AlertDescription>
                You need to connect your Stripe account to start accepting payments.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Onboarding/Management Card */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isConnected ? 'Manage Your Account' : 'Get Started with Stripe'}
          </CardTitle>
          <CardDescription>
            {isConnected
              ? 'Access your Stripe dashboard to view payouts and manage settings'
              : 'Complete the Stripe onboarding process to start receiving payments'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConnected ? (
            <>
              <div className="space-y-3">
                <h4 className="font-semibold">What you'll need:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Business or personal information</li>
                  <li>Bank account details for payouts</li>
                  <li>Tax identification number (SSN or EIN)</li>
                  <li>Government-issued ID (for verification)</li>
                </ul>
              </div>

              <Button
                onClick={startStripeOnboarding}
                disabled={isLoading}
                size="lg"
                className="w-full md:w-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting Onboarding...
                  </>
                ) : (
                  <>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Connect Stripe Account
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground">
                You'll be redirected to Stripe to complete the setup process.
                This typically takes 5-10 minutes.
              </p>
            </>
          ) : (
            <>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Access your Stripe Express dashboard to:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>View your earnings and payouts</li>
                  <li>Update bank account information</li>
                  <li>Download tax documents</li>
                  <li>Manage business settings</li>
                </ul>
              </div>

              <Button
                onClick={manageDashboard}
                disabled={isLoading}
                variant="outline"
                size="lg"
                className="w-full md:w-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Stripe Dashboard
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>About Stripe Connect</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Stripe Connect is a secure payment platform that allows you to receive
            payments from your subscribers directly to your bank account.
          </p>
          <div>
            <p className="font-semibold text-foreground mb-2">Key benefits:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Secure and PCI-compliant payment processing</li>
              <li>Direct deposits to your bank account</li>
              <li>Automatic tax reporting and documentation</li>
              <li>Real-time earnings tracking</li>
              <li>Support for multiple currencies</li>
            </ul>
          </div>
          <p>
            Stripe charges a fee of 2.9% + $0.30 per successful transaction.
            Platform fees may also apply.
          </p>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      {!isConnected && (
        <Card>
          <CardHeader>
            <CardTitle>Having Issues?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              If you're experiencing problems with Stripe onboarding:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Make sure you have all required documents ready</li>
              <li>Try using a different browser or clearing your cache</li>
              <li>Ensure pop-ups are enabled for this site</li>
              <li>Contact our support team for assistance</li>
            </ul>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('Support contact: support@alphamarketplace.com')}
            >
              Contact Support
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
