import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface SubscribeButtonProps {
  creatorId: string
  creatorName: string
  price: number
  isSubscribed: boolean
  onSubscriptionChange?: () => void
}

export function SubscribeButton({
  creatorId,
  price,
  isSubscribed,
}: SubscribeButtonProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubscribe = async () => {
    if (!user) {
      navigate('/login', { state: { from: window.location.pathname } })
      return
    }

    setIsLoading(true)
    try {
      // Call the checkout edge function
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          creatorId,
          priceId: price,
        },
      })

      if (error) throw error

      if (data?.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (error) {
      console.error('Error creating checkout:', error)
      toast.error('Failed to start subscription. Please try again.')
      setIsLoading(false)
    }
  }

  if (isSubscribed) {
    return (
      <Button
        size="lg"
        variant="outline"
        disabled
        className="gap-2"
      >
        <Check className="h-4 w-4" />
        Subscribed
      </Button>
    )
  }

  return (
    <Button
      size="lg"
      onClick={handleSubscribe}
      disabled={isLoading}
      className="gap-2"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          Subscribe for ${(price / 100).toFixed(2)}/month
        </>
      )}
    </Button>
  )
}
