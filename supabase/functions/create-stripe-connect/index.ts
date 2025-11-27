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

    // Get user's creator profile
    const { data: profile, error: profileError } = await supabase
      .from('creator_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileError) {
      throw new Error('Creator profile not found')
    }

    let stripeAccountId = profile.stripe_account_id

    // Create Stripe Connect account if doesn't exist
    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        metadata: {
          user_id: user.id,
          creator_id: profile.id,
        },
      })

      stripeAccountId = account.id

      // Save stripe_account_id to creator_profiles
      const { error: updateError } = await supabase
        .from('creator_profiles')
        .update({ stripe_account_id: stripeAccountId })
        .eq('id', profile.id)

      if (updateError) {
        throw new Error(`Failed to save Stripe account ID: ${updateError.message}`)
      }
    }

    // Create account link for onboarding
    const frontendUrl = Deno.env.get('FRONTEND_URL') || 'http://localhost:8080'
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${frontendUrl}/creator/earnings`,
      return_url: `${frontendUrl}/creator/earnings?onboarding=success`,
      type: 'account_onboarding',
    })

    return new Response(
      JSON.stringify({ url: accountLink.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error creating Stripe Connect account:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
