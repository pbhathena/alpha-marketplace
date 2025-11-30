# Alpha Marketplace - Project Context

## Overview
Alpha Marketplace is a multi-creator subscription platform (similar to Patreon/OnlyFans) where creators can monetize content and fans can subscribe to access exclusive posts.

## Live URL
https://alpha-marketplace-kappa.vercel.app/

## Tech Stack
- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **UI Components:** shadcn/ui (Radix primitives)
- **Backend:** Supabase (Auth, Postgres, Storage, Edge Functions)
- **Data Fetching:** TanStack React Query
- **Routing:** React Router v6
- **Payments:** Stripe Connect (pending API keys)
- **Hosting:** Vercel

---

## Demo Accounts

| Role    | Email              | Password |
|---------|-------------------|----------|
| Fan     | fan@demo.com      | demo123  |
| Creator | creator@demo.com  | demo123  |
| Admin   | admin@demo.com    | demo123  |

---

## Database Schema (Supabase)

### Core Tables
- **profiles** - User profiles (id, email, username, full_name, avatar_url, role, created_at)
- **creator_profiles** - Creator-specific data (user_id, tagline, bio, banner_url, category_id, subscription_price_cents, subscriber_count, stripe_account_id, stripe_onboarding_complete)
- **categories** - Content categories (id, name, slug, display_order)
- **posts** - Creator content (id, creator_id, title, content, media_urls, visibility, like_count, comment_count)
- **post_likes** - Like tracking (id, post_id, user_id)
- **post_comments** - Comments (id, post_id, user_id, content)
- **subscriptions** - Active subscriptions (id, subscriber_id, creator_id, status, stripe_subscription_id)

### Messaging Tables (Added Nov 2024)
- **conversations** - Chat threads between creators and subscribers
- **messages** - Individual messages with read status

---

## User Roles & Access

### Fan (Default)
- Browse public content on Explore page
- Subscribe to creators (requires Stripe)
- View subscribed creator content
- Like and comment on posts
- Access `/my-account` dashboard

### Creator
- All fan permissions
- Access `/dashboard` with:
  - Overview (stats summary)
  - Posts (create/edit/delete content)
  - Analytics (subscribers, revenue, engagement)
  - Settings (profile, pricing)
  - Stripe Setup (connect account)
- Public profile at `/@username`

### Admin
- All permissions
- Access `/admin` portal with:
  - Dashboard (platform stats)
  - Users (manage all users)
  - Creators (manage creators)
  - Revenue (platform earnings)
  - Content (moderation)
  - Settings (platform config)

---

## Features Implemented

### Authentication & Routing
- [x] Email/password auth via Supabase
- [x] Role-based redirects after login (admin→/admin, creator→/dashboard, fan→/my-account)
- [x] Protected routes by role
- [x] Persistent sessions

### Navbar
- [x] Logo links to home
- [x] Explore link
- [x] Notification bell (creators see likes/new subscribers)
- [x] User avatar dropdown with role-specific links
- [x] Mobile hamburger menu

### Explore Page
- [x] Grid of creator cards
- [x] Search by name/username
- [x] Filter by category
- [x] Responsive layout

### Creator Profile (`/@username`)
- [x] Banner and avatar display
- [x] Bio and social links
- [x] Subscription button
- [x] Posts feed (public/subscriber-only)
- [x] Like and comment functionality

### Creator Dashboard (`/dashboard`)
- [x] Overview with stats cards
- [x] Posts management (create, edit, delete)
- [x] Media upload (images/videos via Supabase Storage)
- [x] Analytics page with:
  - Subscriber count & growth
  - Monthly revenue breakdown
  - Post performance metrics
  - Growth tips
- [x] Settings page
- [x] Stripe setup flow (pending keys)

### Patron Dashboard (`/my-account`)
- [x] Overview with subscribed creator content
- [x] Recommended creators section
- [x] My Subscriptions list
- [x] Messages (UI ready, backend connected)
- [x] Billing history
- [x] Account settings

### Admin Portal (`/admin`)
- [x] Dashboard with platform metrics
- [x] Users management table
- [x] Creators management
- [x] Revenue overview
- [x] Content moderation
- [x] Platform settings

### Creator Onboarding (`/become-creator`)
- [x] Multi-step form with progress indicator
- [x] Username validation
- [x] Category selection
- [x] Pricing setup
- [x] Avatar/banner upload
- [x] Redirects to Stripe setup

### Notifications
- [x] Bell icon in navbar
- [x] Shows recent likes on creator posts
- [x] Shows new subscriber notifications
- [x] Unread count badge

### Mobile Responsiveness
- [x] All dashboard headers optimized
- [x] Sidebar collapses to full-width on mobile
- [x] Touch-friendly navigation
- [x] Responsive grids throughout

---

## Pending Features

### Stripe Integration
Requires API keys to be configured:

**Vercel Environment Variables:**
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Supabase Secrets:**
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
```

Edge functions exist for:
- `create-stripe-connect` - Creator onboarding
- `create-checkout` - Subscription checkout
- `stripe-webhook` - Handle Stripe events
- `create-customer-portal` - Manage subscriptions
- `get-stripe-dashboard` - Creator earnings dashboard

### Real-time Messaging
- Database tables created
- UI components ready
- Needs testing with active subscriptions

---

## File Structure

```
src/
├── components/
│   ├── auth/
│   │   └── LoginForm.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── MainLayout.tsx
│   │   └── NotificationDropdown.tsx
│   └── ui/
│       └── (shadcn components)
├── contexts/
│   └── AuthContext.tsx
├── hooks/
│   └── useMessages.ts
├── integrations/
│   └── supabase/
│       └── client.ts
├── pages/
│   ├── Index.tsx
│   ├── Explore.tsx
│   ├── CreatorProfile.tsx
│   ├── PostDetail.tsx
│   ├── Login.tsx
│   ├── Signup.tsx
│   ├── BecomeCreator.tsx
│   ├── CreatorDashboard/
│   │   ├── index.tsx
│   │   ├── Overview.tsx
│   │   ├── Posts.tsx
│   │   ├── Analytics.tsx
│   │   ├── Settings.tsx
│   │   └── StripeSetup.tsx
│   ├── PatronDashboard/
│   │   ├── index.tsx
│   │   ├── Overview.tsx
│   │   ├── Subscriptions.tsx
│   │   ├── Messages.tsx
│   │   ├── Billing.tsx
│   │   └── Settings.tsx
│   └── AdminPortal/
│       ├── index.tsx
│       ├── Dashboard.tsx
│       ├── Users.tsx
│       ├── Creators.tsx
│       ├── Revenue.tsx
│       ├── Content.tsx
│       └── Settings.tsx
├── types/
│   └── database.ts
└── App.tsx

supabase/
├── functions/
│   ├── create-stripe-connect/
│   ├── create-checkout/
│   ├── stripe-webhook/
│   ├── create-customer-portal/
│   └── get-stripe-dashboard/
└── migrations/
    └── 20241128000001_add_messages.sql

scripts/
├── create-demo-users.mjs
└── seed-demo-users.sql
```

---

## Environment Variables

### Frontend (.env)
```
VITE_SUPABASE_URL=https://xigukyglicivnvsloshg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... (pending)
```

### Supabase Edge Functions
```
STRIPE_SECRET_KEY=sk_test_... (pending)
STRIPE_WEBHOOK_SECRET=whsec_... (pending)
```

---

## Deployment

### Vercel
- Auto-deploys on push to `main`
- Build command: `npm run build`
- Output directory: `dist`

### Supabase
- Project: xigukyglicivnvsloshg
- Region: (check dashboard)
- Edge functions deploy via `supabase functions deploy`

---

## Recent Changes (Nov 2024)

1. Fixed login redirect to route users by role
2. Added NotificationDropdown component
3. Created Creator Analytics dashboard
4. Built PatronDashboard with all subpages
5. Built AdminPortal with all subpages
6. Added messaging database schema
7. Polished creator onboarding with step indicator
8. Improved mobile responsiveness across dashboards
9. Fixed Navbar fragment JSX syntax error

---

## Next Steps

1. Configure Stripe API keys
2. Test subscription flow end-to-end
3. Test real-time messaging
4. Add email notifications (optional)
5. Implement content reporting/moderation tools
6. Add creator verification badges (optional)
