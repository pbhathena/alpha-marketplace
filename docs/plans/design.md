# Alpha Marketplace — Platform Design

**Date**: 2025-01-26
**Status**: Approved

## Overview

Alpha Marketplace is a creator-subscription platform for fitness, health, and wellness professionals. Think "OnlyFans for coaches" — SFW content, professional focus.

### Key Decisions

| Decision | Choice |
|----------|--------|
| Model | Subscription-per-creator (OF-style) |
| Content types | Full suite: feeds, resources, Q&A, DMs |
| Creator onboarding | Open marketplace |
| Discovery | Browse catalog + personalized recommendations |
| Tech stack | React + Supabase via Lovable |
| Mobile | Web-first (PWA), native later |
| Payments | Stripe Connect |
| Content policy | SFW only (fitness, education, coaching) |
| Migration | Import existing content from current apps |
| Messaging | Subscriber-only DMs |
| Revenue | 20% platform cut |

---

## User Roles

### Fans (Consumers)
- Browse creator catalog
- Subscribe to individual creators ($X/month, creator sets price)
- Access subscriber-only content: feeds, resources, Q&A, DMs
- Get personalized creator recommendations

### Creators
- Sign up openly, set up profile and subscription price
- Publish content: posts, structured courses/resources, Q&A answers
- Receive DMs from subscribers only
- Get paid monthly via Stripe Connect (80% of subscription revenue)

### Platform Admins
- Moderate content and creators
- View analytics and revenue dashboards
- Manage categories and featured creators
- Handle support escalations

---

## Core Features — Fan Experience

### Discovery & Browsing

**Home Feed**
- Personalized mix of posts from subscribed creators
- "Discover" section with recommended creators based on interests and behavior
- Trending creators and popular content

**Creator Catalog**
- Browse by category (Fitness, Nutrition, Bodybuilding, Wellness, etc.)
- Search by name, topic, tags
- Filter by price range, content type, popularity
- Creator cards show: photo, name, category, subscriber count, price, preview bio

**Creator Profile Page**
- Banner, avatar, bio, social links
- Subscription price and "Subscribe" CTA
- Preview content (teaser posts visible to non-subscribers)
- Tabs: Posts | Resources | Q&A
- Subscriber count, join date

### Subscribed Experience

**Feed**
- Chronological posts from subscribed creators
- Like, comment, save posts
- Filter by creator or view all

**Resources**
- Structured content: courses, video series, articles
- Organized by topic/category per creator
- Progress tracking (for courses)

**Q&A**
- Submit questions to creators
- Browse answered questions
- Upvote questions

**DMs**
- Message any creator you subscribe to
- Inbox with conversation threads

---

## Core Features — Creator Experience

### Onboarding

**Sign Up Flow**
1. Create account (email/password or social auth)
2. Choose "Become a Creator"
3. Complete profile: name, bio, category, avatar, banner
4. Set subscription price (minimum $5/month suggested)
5. Connect Stripe account (Stripe Connect onboarding)
6. Profile goes live

### Content Creation

**Posts**
- Rich text editor with image/video uploads
- Schedule posts for later
- Mark as "Preview" (visible to non-subscribers) or "Subscribers Only"
- Pin important posts to top of profile

**Resources**
- Create structured content: courses, video series, article collections
- Organize into topics/modules
- Upload videos, PDFs, images
- Drag-and-drop ordering

**Q&A Management**
- View incoming questions from subscribers
- Answer with text, video, or audio
- Mark as featured/pinned
- Ignore or hide inappropriate questions

**DMs**
- Inbox of subscriber messages
- Reply at your own pace
- No obligation to respond

### Creator Dashboard

- Subscriber count and growth trends
- Revenue this month / all time
- Top performing content
- Recent activity (new subscribers, comments, DMs)

---

## Technical Architecture

### Frontend (Lovable)

**React + Tailwind CSS**
- Built and edited via Lovable's visual interface
- Non-technical colleagues can modify UI without CLI
- Component-based: reusable cards, forms, modals
- Responsive design (mobile-first for PWA)

**Key Pages**
- `/` — Home feed + discover
- `/explore` — Creator catalog with filters
- `/creator/:username` — Creator profile
- `/creator/:username/resources` — Structured content
- `/messages` — DM inbox
- `/dashboard` — Creator dashboard (for creators)
- `/settings` — Account, billing, notifications

### Backend (Supabase)

**Database (Postgres)**
- `users` — All users (role: fan/creator/admin)
- `creator_profiles` — Bio, category, price, stripe_account_id
- `subscriptions` — Fan → Creator relationships, status, dates
- `posts` — Feed content with visibility flag
- `resources` — Structured content (courses, videos)
- `resource_items` — Individual items within resources
- `questions` — Q&A submissions
- `answers` — Creator responses
- `messages` — DM threads
- `categories` — Platform-wide content categories

**Auth**
- Supabase Auth (email/password + social providers)
- Row-level security policies enforce subscription access

**Storage**
- Supabase Storage for images, videos, PDFs
- Organized buckets: avatars, banners, post-media, resources

**Edge Functions**
- Stripe webhook handlers (subscription events)
- Recommendation engine logic
- Notification triggers

---

## Payments & Subscriptions

### Stripe Connect Integration

**Creator Onboarding**
- Creator clicks "Connect Stripe" during setup
- Redirected to Stripe Connect Express onboarding
- Stripe handles identity verification, bank account, tax info
- Webhook confirms account is active → creator can accept subscriptions

**Subscription Flow**
1. Fan clicks "Subscribe" on creator profile
2. Stripe Checkout session created (creator's connected account as destination)
3. Fan enters payment details
4. Subscription created with automatic monthly renewal
5. Platform takes 20% cut via Stripe Connect `application_fee_percent`

**Money Flow**
```
Fan pays $10/month
├── Stripe fees (~$0.59): deducted first
├── Platform (20%): $1.88 → your Stripe account
└── Creator (80%): $7.53 → creator's Stripe account
```

**Subscription Management**
- Fans can cancel anytime (access until period ends)
- View active subscriptions in settings
- Payment history and receipts via Stripe

**Creator Payouts**
- Stripe handles payouts directly to creator's bank
- Default: daily rolling payouts (Stripe standard)
- Creators manage payout schedule in their Stripe dashboard

### Database Tracking

- `subscriptions` table mirrors Stripe state
- Webhooks update status on: `customer.subscription.created`, `updated`, `deleted`
- Row-level security uses subscription status to gate content

---

## Content Migration

### Migration Strategy

**Source**: Existing backend at `https://iamanalpha1.com/api/`

**What Gets Migrated**

| Content Type | Migration Approach |
|--------------|-------------------|
| Creator profiles | Map to new `creator_profiles` table |
| Feed posts | Import to `posts` with timestamps preserved |
| Resources (topics/subtopics/content) | Flatten to `resources` + `resource_items` |
| Q&A | Import to `questions` + `answers` |
| User accounts | Migrate emails, require password reset |
| Media files | Download and re-upload to Supabase Storage |

**Migration Steps**
1. Export data from existing API (script to pull all endpoints)
2. Transform to new schema (handle structure differences)
3. Upload media to Supabase Storage, update URLs
4. Import to Supabase database
5. Create creator Stripe Connect accounts (manual step per creator)
6. Existing subscribers: grace period or manual migration

### What Doesn't Migrate
- Payment history (fresh start with Stripe Connect)
- Chat/DM history (privacy, fresh start)
- Push notification tokens (new app, new tokens)

### Creator Communication
- Notify existing creators about new platform
- Provide onboarding guide for Stripe Connect setup
- Offer support during transition

---

## Recommendations Engine

### Phase 1: Rule-Based (Launch)

**For New Users (Cold Start)**
- Show popular creators (most subscribers)
- Featured/staff picks
- Creators in trending categories

**For Active Users**
- "More like this" — same category as subscribed creators
- "Fans also subscribe to" — co-subscription patterns
- Recently active creators (posting frequently)

**Signals Used**
- Categories of subscribed creators
- Browsing history (profiles viewed)
- Subscription overlap between users
- Creator activity level

### Phase 2: Personalized (Post-Launch)

Once you have user behavior data:
- Engagement-weighted recommendations (time spent, likes, comments)
- Content-type preferences (some users prefer video, others articles)
- Collaborative filtering (similar users → similar tastes)

### Implementation

**Supabase Edge Function**
- Runs on page load for discover/home
- Queries subscription patterns and category matches
- Returns ranked creator list
- Cache results briefly (5-10 min) for performance

**Database Support**
- `user_events` table: tracks views, clicks, time on page
- Aggregated stats on `creator_profiles`: subscriber_count, engagement_rate

---

## Admin & Moderation

### Admin Dashboard

**Overview**
- Total users, creators, active subscriptions
- Revenue this month (platform cut)
- Growth charts: signups, subscriptions, revenue over time

**Creator Management**
- List all creators with status, subscriber count, revenue
- View individual creator profiles and content
- Suspend/ban creators (disables profile, stops payouts)
- Feature creators on homepage

**User Management**
- Search users by email/name
- View subscription history
- Suspend/ban users
- Handle refund requests (via Stripe dashboard)

**Content Moderation**
- Flagged content queue (user reports)
- Review posts, resources, Q&A for guideline violations
- Remove content with notification to creator
- Moderation action log

### Moderation Tools

**User Reporting**
- "Report" button on posts, profiles, messages
- Report reasons: spam, harassment, inappropriate content, other
- Reports land in admin queue

**Automated Flags**
- Keywords filter (optional, for obvious violations)
- High report volume triggers auto-hide pending review

**Creator Warnings**
- First violation: warning email
- Second violation: content removed
- Third violation: account suspension
- Appeals process via support email

---

## Notifications

### Notification Types

**For Fans**
| Event | In-App | Email | Push (PWA) |
|-------|--------|-------|------------|
| New post from subscribed creator | ✓ | Optional | ✓ |
| Creator answered your question | ✓ | ✓ | ✓ |
| New DM from creator | ✓ | ✓ | ✓ |
| Subscription renewal reminder | — | ✓ | — |
| Subscription failed/expiring | ✓ | ✓ | ✓ |

**For Creators**
| Event | In-App | Email | Push (PWA) |
|-------|--------|-------|------------|
| New subscriber | ✓ | Daily digest | ✓ |
| New DM from subscriber | ✓ | Optional | ✓ |
| New question submitted | ✓ | Daily digest | — |
| Comment on your post | ✓ | Optional | — |
| Payout processed | — | ✓ | — |

### Implementation

**In-App**
- `notifications` table in Supabase
- Real-time via Supabase Realtime subscriptions
- Bell icon with unread count

**Email**
- Supabase Edge Function triggers on events
- Send via Resend, SendGrid, or Supabase's built-in email
- User preferences control which emails they receive

**Push (PWA)**
- Service worker for web push
- User opts in on first visit
- Stored push tokens in `user_devices` table

---

## Implementation Phases

### Phase 1: Foundation (MVP)
**Goal: Core subscription loop working**

- Supabase project setup (database, auth, storage)
- User auth (signup, login, roles)
- Creator profile creation and editing
- Creator catalog with browse/search
- Creator profile pages
- Stripe Connect integration
- Subscription flow (subscribe, cancel)
- Basic feed (posts, subscriber-only gating)

**Outcome**: Fans can discover creators, subscribe, and see posts.

### Phase 2: Full Content Suite
**Goal: All content types functional**

- Resources system (courses, structured content)
- Q&A (submit questions, creator answers)
- DMs (subscriber-only messaging)
- Content visibility controls (preview vs subscriber-only)
- Media uploads (images, videos)

**Outcome**: Full creator toolkit available.

### Phase 3: Discovery & Engagement
**Goal: Help fans find and engage with creators**

- Personalized recommendations
- Categories and filtering
- Likes, comments, saves
- Creator dashboard with analytics
- Notification system (in-app, email, push)

**Outcome**: Engaging, sticky experience.

### Phase 4: Migration & Launch
**Goal: Bring existing creators and content over**

- Migration scripts for existing data
- Creator onboarding for Stripe Connect
- Admin dashboard and moderation tools
- Beta testing with existing creators
- Public launch

### Phase 5: Native Apps (Future)
**Goal: App store presence**

- React Native or Flutter wrapper
- Push notifications via native
- App store submission

---

## Next Steps

1. Create Lovable project
2. Set up Supabase project
3. Create Stripe Connect platform account
4. Begin Phase 1 implementation
