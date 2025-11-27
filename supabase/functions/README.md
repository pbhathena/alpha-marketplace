# Supabase Edge Functions for Stripe Connect

This directory contains all the Edge Functions needed for Stripe Connect integration in the Alpha Marketplace.

## Functions Overview

### Shared Utilities

- **_shared/cors.ts** - CORS headers configuration for all functions
- **_shared/supabase.ts** - Supabase client helpers and authentication utilities

### Creator Functions

#### create-stripe-connect
Creates or retrieves a Stripe Connect Express account for creators and generates an onboarding URL.

**Endpoint:** POST `/create-stripe-connect`
**Auth:** Required
**Request:** None
**Response:**
```json
{
  "url": "https://connect.stripe.com/setup/..."
}
```

#### get-stripe-dashboard
Generates a Stripe Express Dashboard login link for creators to view their earnings and payouts.

**Endpoint:** POST `/get-stripe-dashboard`
**Auth:** Required
**Request:** None
**Response:**
```json
{
  "url": "https://connect.stripe.com/express/..."
}
```

### Subscription Functions

#### create-checkout
Creates a Stripe Checkout session for subscribers to subscribe to a creator.

**Endpoint:** POST `/create-checkout`
**Auth:** Required
**Request:**
```json
{
  "creatorId": "uuid"
}
```
**Response:**
```json
{
  "url": "https://checkout.stripe.com/...",
  "sessionId": "cs_..."
}
```

#### create-customer-portal
Generates a Stripe Customer Portal session for subscribers to manage their subscriptions.

**Endpoint:** POST `/create-customer-portal`
**Auth:** Required
**Request:** None
**Response:**
```json
{
  "url": "https://billing.stripe.com/..."
}
```

### Webhook Handler

#### stripe-webhook
Handles Stripe webhook events to keep the database in sync with Stripe.

**Endpoint:** POST `/stripe-webhook`
**Auth:** Webhook signature verification
**Events Handled:**
- `account.updated` - Updates creator's onboarding completion status
- `checkout.session.completed` - Creates subscription record
- `customer.subscription.updated` - Updates subscription status
- `customer.subscription.deleted` - Marks subscription as canceled
- `invoice.payment_failed` - Updates subscription to past_due

## Environment Variables

Required environment variables for all functions:

```env
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
FRONTEND_URL=http://localhost:8080
```

## Deployment

Deploy functions using the Supabase CLI:

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy create-stripe-connect

# Deploy with environment variables
supabase secrets set STRIPE_SECRET_KEY=sk_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set FRONTEND_URL=https://your-domain.com
```

## Local Development

Run functions locally:

```bash
# Start local Supabase
supabase start

# Serve a specific function
supabase functions serve create-checkout --env-file .env.local

# Test with curl
curl -X POST http://localhost:54321/functions/v1/create-checkout \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"creatorId": "uuid"}'
```

## Webhook Setup

1. In Stripe Dashboard, go to Developers > Webhooks
2. Add endpoint: `https://xxx.supabase.co/functions/v1/stripe-webhook`
3. Select events:
   - account.updated
   - checkout.session.completed
   - customer.subscription.updated
   - customer.subscription.deleted
   - invoice.payment_failed
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

## Testing Webhooks Locally

Use Stripe CLI to forward webhooks:

```bash
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
```

## Platform Fee Structure

The marketplace takes a 20% platform fee on all subscriptions:
- Configured in `create-checkout` via `application_fee_percent: 20`
- Creators receive 80% of subscription revenue
- Transfers automatically go to creator's connected account

## Security Notes

- All functions verify user authentication via JWT
- Webhook events are verified using Stripe signature validation
- Service role key is used for admin operations
- CORS is configured to allow requests from any origin (adjust in production)
