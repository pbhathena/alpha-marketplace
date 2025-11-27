-- Alpha Marketplace Demo Data Seeding
-- Run this in the Supabase SQL Editor: https://supabase.com/dashboard/project/xigukyglicivnvsloshg/sql/new

-- Step 1: Create demo users in auth.users (requires service role)
-- These are demo accounts - in production, users sign up normally

-- Generate UUIDs for our demo users
DO $$
DECLARE
  mike_user_id UUID := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  dave_user_id UUID := 'b2c3d4e5-f6a7-8901-bcde-f12345678901';
  alex_user_id UUID := 'c3d4e5f6-a7b8-9012-cdef-123456789012';
  sarah_user_id UUID := 'd4e5f6a7-b8c9-0123-def0-234567890123';

  bodybuilding_cat_id UUID;
  fitness_cat_id UUID;
  nutrition_cat_id UUID;
BEGIN
  -- Get category IDs
  SELECT id INTO bodybuilding_cat_id FROM public.categories WHERE slug = 'bodybuilding' LIMIT 1;
  SELECT id INTO fitness_cat_id FROM public.categories WHERE slug = 'fitness' LIMIT 1;
  SELECT id INTO nutrition_cat_id FROM public.categories WHERE slug = 'nutrition' LIMIT 1;

  -- Insert into auth.users (this requires running as service role)
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
  VALUES
    (mike_user_id, 'mike@iamanalpha.com', crypt('DemoPassword123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"full_name": "Mike Davies"}'::jsonb),
    (dave_user_id, 'dave@iamanalpha.com', crypt('DemoPassword123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"full_name": "Dave Palumbo"}'::jsonb),
    (alex_user_id, 'alex@iamanalpha.com', crypt('DemoPassword123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"full_name": "Alex Fitness"}'::jsonb),
    (sarah_user_id, 'sarah@iamanalpha.com', crypt('DemoPassword123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"full_name": "Sarah Nutrition"}'::jsonb)
  ON CONFLICT (id) DO NOTHING;

  -- The trigger should auto-create profiles, but let's ensure they exist
  INSERT INTO public.profiles (id, email, full_name, username, avatar_url, role)
  VALUES
    (mike_user_id, 'mike@iamanalpha.com', 'Mike Davies', 'mikedavies', 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=400&fit=crop', 'creator'),
    (dave_user_id, 'dave@iamanalpha.com', 'Dave Palumbo', 'davepalumbo', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop', 'creator'),
    (alex_user_id, 'alex@iamanalpha.com', 'Alex Fitness', 'alexfitness', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop', 'creator'),
    (sarah_user_id, 'sarah@iamanalpha.com', 'Sarah Nutrition', 'sarahnutrition', 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=400&fit=crop', 'creator')
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    username = EXCLUDED.username,
    avatar_url = EXCLUDED.avatar_url,
    role = EXCLUDED.role;

  -- Create creator profiles
  INSERT INTO public.creator_profiles (user_id, bio, tagline, category_id, subscription_price_cents, is_featured, is_active, subscriber_count, social_links)
  VALUES
    (mike_user_id,
     'Founder & CEO of Alpha. Former professional bodybuilder with over 20 years of experience in fitness, business, and coaching. I help people transform their bodies and minds.',
     'We Empower Alphas',
     bodybuilding_cat_id,
     2999,
     true,
     true,
     1250,
     '{"instagram": "https://instagram.com/mikedavies", "youtube": "https://youtube.com/@mikedavies"}'::jsonb),

    (dave_user_id,
     'Professional bodybuilder, nutritionist, and founder of RXMuscle. Known for expertise in contest prep, nutrition protocols, and training science.',
     'Science-Based Bodybuilding',
     bodybuilding_cat_id,
     2499,
     true,
     true,
     890,
     '{"instagram": "https://instagram.com/davepalumbo", "youtube": "https://youtube.com/@rxmuscle"}'::jsonb),

    (alex_user_id,
     'Certified personal trainer specializing in strength training, HIIT, and functional fitness. Transform your body with proven workout programs.',
     'Train Like a Champion',
     fitness_cat_id,
     1999,
     false,
     true,
     456,
     '{"instagram": "https://instagram.com/alexfitness"}'::jsonb),

    (sarah_user_id,
     'Registered dietitian and sports nutritionist. Custom meal plans, macro coaching, and evidence-based nutrition advice for optimal performance.',
     'Fuel Your Performance',
     nutrition_cat_id,
     1499,
     false,
     true,
     324,
     '{"instagram": "https://instagram.com/sarahnutrition"}'::jsonb)
  ON CONFLICT (user_id) DO UPDATE SET
    bio = EXCLUDED.bio,
    tagline = EXCLUDED.tagline,
    category_id = EXCLUDED.category_id,
    subscription_price_cents = EXCLUDED.subscription_price_cents,
    is_featured = EXCLUDED.is_featured,
    subscriber_count = EXCLUDED.subscriber_count;

  RAISE NOTICE 'Demo data seeded successfully!';
END $$;

-- Verify the data
SELECT
  p.full_name,
  p.username,
  cp.tagline,
  cp.subscription_price_cents,
  cp.subscriber_count,
  c.name as category
FROM public.profiles p
JOIN public.creator_profiles cp ON cp.user_id = p.id
LEFT JOIN public.categories c ON c.id = cp.category_id
WHERE p.role = 'creator';
