# Alpha Marketplace - Phase 1 Implementation Plan

## Overview

This document provides a detailed, step-by-step implementation plan for Phase 1 (Foundation/MVP) of the Alpha Marketplace platform. Phase 1 establishes the core subscription loop: fans can discover creators, subscribe, and access subscriber-only content.

**Phase 1 Scope:**
- Supabase project setup (database, auth, storage)
- User auth (signup, login, roles)
- Creator profile creation and editing
- Creator catalog with browse/search
- Creator profile pages
- Stripe Connect integration
- Subscription flow (subscribe, cancel)
- Basic feed (posts, subscriber-only gating)

**Tech Stack:**
- React + TypeScript + Tailwind CSS (Vite-based, Lovable-compatible)
- Supabase (Postgres, Auth, Storage, Edge Functions)
- Stripe Connect

---

## Task Dependencies

```
Task 1: Supabase Project Setup
    │
    ▼
Task 2: Database Schema & RLS
    │
    ├──▶ Task 3: Auth System
    │         │
    │         ▼
    │     Task 4: Creator Profile CRUD
    │         │
    ├─────────┴──▶ Task 5: Stripe Connect Integration
              │         │
              ▼         ▼
          Task 6: Creator Catalog & Search
              │
              ▼
          Task 7: Creator Profile Pages
              │
              ▼
          Task 8: Subscription Flow
              │
              ▼
          Task 9: Basic Feed System
```

---

## Task 1: Supabase Project Setup

### 1.1 Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Configure:
   - **Name:** `alpha-marketplace`
   - **Database Password:** Generate and save securely
   - **Region:** Choose closest to primary users
4. Wait for provisioning (2-3 minutes)

### 1.2 Collect Credentials

Navigate to **Settings > API** and record:

```
VITE_SUPABASE_URL=https://[PROJECT_REF].supabase.co
VITE_SUPABASE_ANON_KEY=[anon/public key]
SUPABASE_SERVICE_ROLE_KEY=[service_role key - keep secret!]
```

### 1.3 Configure Storage Buckets

Create buckets via SQL Editor:

```sql
INSERT INTO storage.buckets (id, name, public) VALUES
  ('avatars', 'avatars', true),
  ('banners', 'banners', true),
  ('post-media', 'post-media', false);
```

### 1.4 Verification
- [ ] Project accessible in Supabase dashboard
- [ ] Storage buckets created
- [ ] Environment variables saved to `.env`

---

## Task 2: Database Schema & Row-Level Security

### 2.1 Core Schema

Run in SQL Editor:

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE user_role AS ENUM ('fan', 'creator', 'admin');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'incomplete');
CREATE TYPE post_visibility AS ENUM ('public', 'subscribers_only');

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  role user_role DEFAULT 'fan',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Creator profiles
CREATE TABLE creator_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  bio TEXT,
  tagline TEXT,
  banner_url TEXT,
  category_id UUID REFERENCES categories(id),
  subscription_price_cents INTEGER NOT NULL DEFAULT 999,
  stripe_account_id TEXT,
  stripe_onboarding_complete BOOLEAN DEFAULT FALSE,
  subscriber_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  social_links JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscriber_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  status subscription_status DEFAULT 'incomplete',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subscriber_id, creator_id)
);

-- Posts
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  visibility post_visibility DEFAULT 'subscribers_only',
  is_pinned BOOLEAN DEFAULT FALSE,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post likes
CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);
```

### 2.2 Indexes

```sql
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_creator_profiles_user_id ON creator_profiles(user_id);
CREATE INDEX idx_creator_profiles_category ON creator_profiles(category_id);
CREATE INDEX idx_creator_profiles_active ON creator_profiles(is_active) WHERE is_active = true;
CREATE INDEX idx_subscriptions_subscriber ON subscriptions(subscriber_id);
CREATE INDEX idx_subscriptions_creator ON subscriptions(creator_id);
CREATE INDEX idx_subscriptions_active ON subscriptions(subscriber_id, creator_id) WHERE status = 'active';
CREATE INDEX idx_posts_creator ON posts(creator_id);
CREATE INDEX idx_posts_published ON posts(published_at DESC);
```

### 2.3 Helper Functions

```sql
-- Check active subscription
CREATE OR REPLACE FUNCTION has_active_subscription(subscriber UUID, creator UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM subscriptions
    WHERE subscriber_id = subscriber
    AND creator_id = creator
    AND status = 'active'
    AND (current_period_end IS NULL OR current_period_end > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 2.4 Row-Level Security

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Profiles: public read, self write
CREATE POLICY "Profiles viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Creator profiles: active public, self write
CREATE POLICY "Active creators viewable" ON creator_profiles FOR SELECT USING (is_active = true);
CREATE POLICY "Create own creator profile" ON creator_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own creator profile" ON creator_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Subscriptions: own subscriptions visible
CREATE POLICY "View own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = subscriber_id);
CREATE POLICY "Creators view their subscribers" ON subscriptions FOR SELECT USING (auth.uid() = creator_id);
CREATE POLICY "Create own subscription" ON subscriptions FOR INSERT WITH CHECK (auth.uid() = subscriber_id);

-- Posts: public visible, subscriber-only gated
CREATE POLICY "Public posts visible" ON posts FOR SELECT USING (visibility = 'public');
CREATE POLICY "Subscriber posts visible" ON posts FOR SELECT
  USING (visibility = 'subscribers_only' AND (auth.uid() = creator_id OR has_active_subscription(auth.uid(), creator_id)));
CREATE POLICY "Creators create posts" ON posts FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators update posts" ON posts FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Creators delete posts" ON posts FOR DELETE USING (auth.uid() = creator_id);

-- Categories: public read
CREATE POLICY "Categories viewable" ON categories FOR SELECT USING (true);
```

### 2.5 Seed Categories

```sql
INSERT INTO categories (name, slug, description, icon, display_order) VALUES
  ('Fitness', 'fitness', 'Workout programs and fitness coaching', 'Dumbbell', 1),
  ('Nutrition', 'nutrition', 'Meal plans and dietary guidance', 'Apple', 2),
  ('Bodybuilding', 'bodybuilding', 'Muscle building and physique coaching', 'Trophy', 3),
  ('Wellness', 'wellness', 'Mental health and holistic wellness', 'Heart', 4),
  ('Yoga', 'yoga', 'Yoga practices and mindfulness', 'Sparkles', 5),
  ('Running', 'running', 'Running coaching and endurance', 'Timer', 6),
  ('CrossFit', 'crossfit', 'CrossFit and functional fitness', 'Flame', 7),
  ('Sports', 'sports', 'Sport-specific training', 'Medal', 8);
```

### 2.6 Verification
- [ ] All tables created
- [ ] RLS enabled on all tables
- [ ] Policies applied
- [ ] Test: signup creates profile automatically

---

## Task 3: Auth System

### 3.1 File Structure

```
src/
├── contexts/
│   └── AuthContext.tsx
├── components/
│   └── auth/
│       ├── LoginForm.tsx
│       ├── SignupForm.tsx
│       └── ProtectedRoute.tsx
├── pages/
│   ├── Login.tsx
│   └── Signup.tsx
└── lib/
    └── supabase.ts
```

### 3.2 Supabase Client

**File:** `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 3.3 Auth Context

**File:** `src/contexts/AuthContext.tsx`

Provides:
- `user` - Current Supabase user
- `profile` - User's profile from profiles table
- `creatorProfile` - Creator profile if role is creator
- `isLoading` - Auth loading state
- `isCreator` - Boolean for creator role
- `signUp(email, password, fullName)` - Register
- `signIn(email, password)` - Login
- `signOut()` - Logout
- `refreshProfile()` - Reload profile data

### 3.4 Components

**LoginForm.tsx** - Email/password login with error handling
**SignupForm.tsx** - Registration with name, email, password, confirm
**ProtectedRoute.tsx** - Wrapper that redirects unauthenticated users

### 3.5 Verification
- [ ] Can sign up new user
- [ ] Profile auto-created in database
- [ ] Can log in
- [ ] Protected routes redirect when not authenticated
- [ ] Auth persists on refresh

---

## Task 4: Creator Profile CRUD

### 4.1 File Structure

```
src/
├── pages/
│   └── BecomeCreator.tsx
├── components/
│   └── creator/
│       └── EditProfileForm.tsx
```

### 4.2 Become Creator Page

**File:** `src/pages/BecomeCreator.tsx`

Features:
- Username input with validation
- Tagline and bio
- Category selection
- Subscription price input
- Avatar and banner upload
- Redirects to Stripe setup on complete

### 4.3 Edit Profile Form

**File:** `src/components/creator/EditProfileForm.tsx`

Features:
- Pre-filled with existing data
- Same fields as onboarding
- Social links (Instagram, Twitter, YouTube)
- Save updates to database

### 4.4 Verification
- [ ] Can access /become-creator when logged in
- [ ] Form validates username
- [ ] Images upload to Supabase Storage
- [ ] Profile created in database
- [ ] Role updated to 'creator'
- [ ] Edit form loads existing data
- [ ] Changes persist

---

## Task 5: Stripe Connect Integration

### 5.1 Stripe Dashboard Setup

1. Enable Connect at https://dashboard.stripe.com/connect
2. Configure Express accounts
3. Get API keys:
   - `STRIPE_PUBLISHABLE_KEY` (pk_test_...)
   - `STRIPE_SECRET_KEY` (sk_test_...)
4. Set up webhook endpoint
5. Get webhook secret: `whsec_...`

### 5.2 Edge Functions

**Directory:** `supabase/functions/`

| Function | Purpose |
|----------|---------|
| `stripe-connect-onboard` | Create Connect account & onboarding link |
| `stripe-create-checkout` | Create subscription checkout session |
| `stripe-webhook` | Handle Stripe events |
| `stripe-customer-portal` | Create billing portal session |

### 5.3 Onboarding Flow

1. Creator clicks "Connect Stripe"
2. Edge function creates Express account
3. Returns onboarding URL
4. Creator completes Stripe onboarding
5. Webhook updates `stripe_onboarding_complete`

### 5.4 Verification
- [ ] Can create Stripe Connect account
- [ ] Onboarding redirects work
- [ ] Webhook updates database
- [ ] `stripe_onboarding_complete` set to true

---

## Task 6: Creator Catalog & Search

### 6.1 File Structure

```
src/
├── pages/
│   └── Explore.tsx
├── components/
│   └── creator/
│       ├── CreatorCard.tsx
│       ├── CreatorGrid.tsx
│       ├── CategoryFilter.tsx
│       └── SearchBar.tsx
```

### 6.2 Explore Page

**File:** `src/pages/Explore.tsx`

Features:
- Search bar (name, tagline)
- Category filter pills
- Price range filter
- Sort by (popular, newest, price)
- Paginated creator grid

### 6.3 Creator Card

**File:** `src/components/creator/CreatorCard.tsx`

Displays:
- Avatar
- Banner (cropped)
- Name
- Tagline
- Category badge
- Subscriber count
- Price
- Link to profile

### 6.4 Verification
- [ ] Explore page loads creators
- [ ] Search filters results
- [ ] Category filter works
- [ ] Cards link to profiles
- [ ] Pagination works

---

## Task 7: Creator Profile Pages

### 7.1 File Structure

```
src/
├── pages/
│   └── CreatorProfile.tsx
├── components/
│   └── creator/
│       ├── ProfileHeader.tsx
│       ├── SubscribeButton.tsx
│       └── ContentTabs.tsx
```

### 7.2 Profile Page

**File:** `src/pages/CreatorProfile.tsx`

Route: `/creator/:username`

Sections:
- Banner image
- Avatar + name + tagline
- Subscribe button with price
- Subscriber count
- Social links
- Bio
- Content tabs (Posts only for Phase 1)

### 7.3 Subscribe Button

Shows:
- Price per month
- "Subscribe" for non-subscribers
- "Subscribed" badge for active subscribers
- Redirects to login if not authenticated

### 7.4 Verification
- [ ] Profile loads by username
- [ ] Banner and avatar display
- [ ] Subscribe button shows correct state
- [ ] Bio and social links display

---

## Task 8: Subscription Flow

### 8.1 Subscribe Flow

1. Fan clicks "Subscribe" on creator profile
2. If not logged in → redirect to login
3. Call `stripe-create-checkout` edge function
4. Redirect to Stripe Checkout
5. On success → webhook creates subscription
6. Redirect back to creator profile

### 8.2 Cancel Flow

1. Subscriber goes to Settings
2. Clicks "Manage Subscription"
3. Call `stripe-customer-portal` edge function
4. Redirect to Stripe Customer Portal
5. Cancel in portal
6. Webhook updates subscription status

### 8.3 Verification
- [ ] Subscribe button initiates checkout
- [ ] Checkout completes successfully
- [ ] Subscription created in database
- [ ] Access granted to subscriber content
- [ ] Can cancel via portal
- [ ] Cancellation updates database

---

## Task 9: Basic Feed System

### 9.1 File Structure

```
src/
├── components/
│   └── feed/
│       ├── PostCard.tsx
│       ├── PostFeed.tsx
│       ├── CreatePostForm.tsx
│       └── LikeButton.tsx
├── pages/
│   └── CreatorDashboard/
│       └── Posts.tsx
```

### 9.2 Post Card

**File:** `src/components/feed/PostCard.tsx`

Displays:
- Creator avatar + name
- Post content (text)
- Media (images/videos)
- Like count + button
- Timestamp
- Visibility badge (public/subscribers)

### 9.3 Create Post Form

**File:** `src/components/feed/CreatePostForm.tsx`

Features:
- Text content input
- Media upload (drag & drop)
- Visibility toggle (public/subscribers only)
- Pin post option
- Submit button

### 9.4 Feed Display

On creator profile:
- Show posts for that creator
- Public posts visible to all
- Subscriber-only posts gated (show blur/lock for non-subscribers)

### 9.5 Verification
- [ ] Creator can create posts
- [ ] Posts display on profile
- [ ] Public posts visible to all
- [ ] Subscriber posts gated
- [ ] Like button works
- [ ] Media uploads work

---

## Summary: Files to Create

### Configuration
- `.env` - Environment variables
- `supabase/migrations/` - Database migrations

### Contexts
- `src/contexts/AuthContext.tsx`

### Lib
- `src/lib/supabase.ts`

### Pages
- `src/pages/Login.tsx`
- `src/pages/Signup.tsx`
- `src/pages/Explore.tsx`
- `src/pages/CreatorProfile.tsx`
- `src/pages/BecomeCreator.tsx`
- `src/pages/Settings.tsx`
- `src/pages/CreatorDashboard/index.tsx`
- `src/pages/CreatorDashboard/Posts.tsx`
- `src/pages/CreatorDashboard/StripeSetup.tsx`

### Components
- `src/components/auth/LoginForm.tsx`
- `src/components/auth/SignupForm.tsx`
- `src/components/auth/ProtectedRoute.tsx`
- `src/components/creator/CreatorCard.tsx`
- `src/components/creator/CreatorGrid.tsx`
- `src/components/creator/ProfileHeader.tsx`
- `src/components/creator/SubscribeButton.tsx`
- `src/components/creator/EditProfileForm.tsx`
- `src/components/creator/CategoryFilter.tsx`
- `src/components/creator/SearchBar.tsx`
- `src/components/feed/PostCard.tsx`
- `src/components/feed/PostFeed.tsx`
- `src/components/feed/CreatePostForm.tsx`
- `src/components/feed/LikeButton.tsx`
- `src/components/layout/Navbar.tsx`
- `src/components/layout/Footer.tsx`

### Edge Functions
- `supabase/functions/stripe-connect-onboard/index.ts`
- `supabase/functions/stripe-create-checkout/index.ts`
- `supabase/functions/stripe-webhook/index.ts`
- `supabase/functions/stripe-customer-portal/index.ts`

---

## Next Steps After Phase 1

1. **Phase 2:** Resources, Q&A, DMs
2. **Phase 3:** Recommendations, notifications, analytics
3. **Phase 4:** Migration, admin tools, launch
4. **Phase 5:** Native apps
