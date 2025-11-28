-- ==============================================
-- DEMO USER SEED SCRIPT
-- ==============================================
-- Run this in Supabase SQL Editor after creating demo users via signup
--
-- Step 1: Sign up these users at your app's /signup page:
--   - fan@demo.com / demo123
--   - creator@demo.com / demo123
--   - admin@demo.com / demo123
--
-- Step 2: Run this SQL to set their roles:

-- Set admin role
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@demo.com';

-- Set creator role
UPDATE public.profiles
SET role = 'creator'
WHERE email = 'creator@demo.com';

-- Fan role is default, but ensure it's set
UPDATE public.profiles
SET role = 'fan'
WHERE email = 'fan@demo.com';

-- Create creator profile for creator@demo.com
INSERT INTO public.creator_profiles (
  user_id,
  tagline,
  bio,
  subscription_price_cents,
  is_active,
  stripe_onboarding_complete
)
SELECT
  id,
  'Demo Creator Account',
  'This is a demo creator account for testing purposes.',
  999, -- $9.99/month
  true,
  true
FROM public.profiles
WHERE email = 'creator@demo.com'
ON CONFLICT (user_id) DO NOTHING;

-- Verify the setup
SELECT email, role, username, full_name
FROM public.profiles
WHERE email IN ('fan@demo.com', 'creator@demo.com', 'admin@demo.com');
