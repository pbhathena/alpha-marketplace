import Stripe from 'https://esm.sh/stripe@14.5.0?target=deno'
import { corsHeaders } from '../_shared/cors.ts'
import { getUserFromRequest, createSupabaseAdminClient } from '../_shared/supabase.ts'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verify user is authenticated
    const user = await getUserFromRequest(req)
    const supabase = createSupabaseAdminClient()

    // Get customer's stripe_customer_id from stripe_customers table
    const { data: stripeCustomer, error: customerError } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (customerError || !stripeCustomer) {
      throw new Error('No Stripe customer found. You need to subscribe to a creator first.')
    }

    // Create portal session
    const frontendUrl = Deno.env.get('FRONTEND_URL') || 'http://localhost:8080'
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomer.stripe_customer_id,
      return_url: `${frontendUrl}/subscriptions`,
    })

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error creating customer portal session:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
