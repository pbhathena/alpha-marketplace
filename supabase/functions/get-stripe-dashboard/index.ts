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

    // Get user's creator profile with stripe_account_id
    const { data: profile, error: profileError } = await supabase
      .from('creator_profiles')
      .select('stripe_account_id')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      throw new Error('Creator profile not found')
    }

    if (!profile.stripe_account_id) {
      throw new Error('Stripe account not set up. Please complete onboarding first.')
    }

    // Create Stripe login link
    const loginLink = await stripe.accounts.createLoginLink(profile.stripe_account_id)

    return new Response(
      JSON.stringify({ url: loginLink.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error creating Stripe dashboard link:', error)
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
