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

    // Get request body
    const { creatorId } = await req.json()

    if (!creatorId) {
      throw new Error('Creator ID is required')
    }

    // Get creator profile and stripe_account_id
    const { data: creatorProfile, error: creatorError } = await supabase
      .from('creator_profiles')
      .select('stripe_account_id, stripe_price_id, user_id')
      .eq('id', creatorId)
      .single()

    if (creatorError || !creatorProfile) {
      throw new Error('Creator profile not found')
    }

    if (!creatorProfile.stripe_account_id) {
      throw new Error('Creator has not set up their Stripe account')
    }

    if (!creatorProfile.stripe_price_id) {
      throw new Error('Creator has not set up their pricing')
    }

    // Prevent self-subscription
    if (creatorProfile.user_id === user.id) {
      throw new Error('You cannot subscribe to yourself')
    }

    // Get or create Stripe customer for subscriber
    const { data: existingCustomer } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    let customerId = existingCustomer?.stripe_customer_id

    if (!customerId) {
      // Get user email
      const { data: { user: userData } } = await supabase.auth.admin.getUserById(user.id)

      const customer = await stripe.customers.create({
        email: userData?.email,
        metadata: {
          user_id: user.id,
        },
      })

      customerId = customer.id

      // Save customer ID
      await supabase
        .from('stripe_customers')
        .insert({
          user_id: user.id,
          stripe_customer_id: customerId,
        })
    }

    // Create Checkout session
    const frontendUrl = Deno.env.get('FRONTEND_URL') || 'http://localhost:8080'
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [
        {
          price: creatorProfile.stripe_price_id,
          quantity: 1,
        },
      ],
      success_url: `${frontendUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/creator/${creatorId}`,
      subscription_data: {
        application_fee_percent: 20,
        transfer_data: {
          destination: creatorProfile.stripe_account_id,
        },
        metadata: {
          subscriber_id: user.id,
          creator_id: creatorId,
        },
      },
      metadata: {
        subscriber_id: user.id,
        creator_id: creatorId,
      },
    })

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
