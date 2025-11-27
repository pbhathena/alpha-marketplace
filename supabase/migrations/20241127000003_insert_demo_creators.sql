-- Insert Demo Creators
-- This migration creates demo users directly in auth.users and corresponding profiles/creator_profiles

-- First, let's insert directly into auth.users (this table is managed by Supabase Auth)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_sent_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin
)
VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'authenticated',
    'authenticated',
    'mike@iamanalpha.com',
    crypt('DemoAlpha2024!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"full_name": "Mike Davies"}'::jsonb,
    false
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'authenticated',
    'authenticated',
    'dave@iamanalpha.com',
    crypt('DemoAlpha2024!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"full_name": "Dave Palumbo"}'::jsonb,
    false
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'c3d4e5f6-a7b8-9012-cdef-123456789012',
    'authenticated',
    'authenticated',
    'alex@iamanalpha.com',
    crypt('DemoAlpha2024!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"full_name": "Alex Trainer"}'::jsonb,
    false
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'd4e5f6a7-b8c9-0123-def0-234567890123',
    'authenticated',
    'authenticated',
    'sarah@iamanalpha.com',
    crypt('DemoAlpha2024!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"full_name": "Sarah Wellness"}'::jsonb,
    false
  )
ON CONFLICT (id) DO NOTHING;

-- Wait for trigger to create profiles, then update them
-- Update profiles with additional info
UPDATE public.profiles SET
  username = 'mikedavies',
  avatar_url = 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=400&fit=crop',
  role = 'creator'
WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

UPDATE public.profiles SET
  username = 'davepalumbo',
  avatar_url = 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop',
  role = 'creator'
WHERE id = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';

UPDATE public.profiles SET
  username = 'alextrainer',
  avatar_url = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop',
  role = 'creator'
WHERE id = 'c3d4e5f6-a7b8-9012-cdef-123456789012';

UPDATE public.profiles SET
  username = 'sarahwellness',
  avatar_url = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=400&fit=crop',
  role = 'creator'
WHERE id = 'd4e5f6a7-b8c9-0123-def0-234567890123';

-- Create creator profiles
INSERT INTO public.creator_profiles (
  user_id,
  bio,
  tagline,
  category_id,
  subscription_price_cents,
  is_featured,
  is_active,
  subscriber_count,
  social_links
)
SELECT
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'Founder & CEO of Alpha. Former professional bodybuilder with over 20 years of experience in fitness, business, and coaching. I help people transform their bodies and minds.',
  'We Empower Alphas',
  id,
  2999,
  true,
  true,
  1250,
  '{"instagram": "https://instagram.com/mikedavies", "youtube": "https://youtube.com/@mikedavies"}'::jsonb
FROM public.categories WHERE slug = 'bodybuilding'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.creator_profiles (
  user_id,
  bio,
  tagline,
  category_id,
  subscription_price_cents,
  is_featured,
  is_active,
  subscriber_count,
  social_links
)
SELECT
  'b2c3d4e5-f6a7-8901-bcde-f12345678901'::uuid,
  'Professional bodybuilder, nutritionist, and founder of RXMuscle. Known for expertise in contest prep, nutrition protocols, and training science.',
  'Science-Based Bodybuilding',
  id,
  2499,
  true,
  true,
  890,
  '{"instagram": "https://instagram.com/davepalumbo", "youtube": "https://youtube.com/@rxmuscle"}'::jsonb
FROM public.categories WHERE slug = 'bodybuilding'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.creator_profiles (
  user_id,
  bio,
  tagline,
  category_id,
  subscription_price_cents,
  is_featured,
  is_active,
  subscriber_count,
  social_links
)
SELECT
  'c3d4e5f6-a7b8-9012-cdef-123456789012'::uuid,
  'Certified personal trainer specializing in strength training, HIIT, and functional fitness. Transform your body with proven workout programs.',
  'Train Like a Champion',
  id,
  1999,
  false,
  true,
  456,
  '{"instagram": "https://instagram.com/alextrainer"}'::jsonb
FROM public.categories WHERE slug = 'fitness'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.creator_profiles (
  user_id,
  bio,
  tagline,
  category_id,
  subscription_price_cents,
  is_featured,
  is_active,
  subscriber_count,
  social_links
)
SELECT
  'd4e5f6a7-b8c9-0123-def0-234567890123'::uuid,
  'Registered dietitian and sports nutritionist. Custom meal plans, macro coaching, and evidence-based nutrition advice for optimal performance.',
  'Fuel Your Performance',
  id,
  1499,
  false,
  true,
  324,
  '{"instagram": "https://instagram.com/sarahwellness"}'::jsonb
FROM public.categories WHERE slug = 'nutrition'
ON CONFLICT (user_id) DO NOTHING;
