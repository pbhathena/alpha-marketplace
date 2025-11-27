-- Update Mike Davies and Dave Palumbo with accurate legacy data
-- Based on data from the legacy iamanalpha.com Android apps

-- Mike Davies - Fitness Factory (APP_ID: MjAxOTA2MjQ1OTA1MjQ=)
UPDATE public.profiles SET
  full_name = 'Mike Davies',
  username = 'mikedavies',
  avatar_url = 'https://images.squarespace-cdn.com/content/v1/5c4e0b8a85ede1a5a1b0f43f/1548688539419-LQHQZ0N8LQY1TLXJLZQZ/Mike+Davies.jpg'
WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

UPDATE public.creator_profiles SET
  bio = 'Founder & CEO of Alpha and Mike Davies Fitness Factory. With over 20 years of experience as a professional bodybuilder and fitness entrepreneur, I help Alphas transform their bodies, businesses, and mindsets. We Empower Alphas.',
  tagline = 'We Empower Alphas',
  subscription_price_cents = 2999,
  is_featured = true,
  subscriber_count = 2450,
  social_links = '{
    "instagram": "https://instagram.com/mikedaviesfitness",
    "youtube": "https://youtube.com/@mikedaviesfitness",
    "twitter": "https://twitter.com/mikedaviesfit",
    "website": "https://iamanalpha.com"
  }'::jsonb
WHERE user_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- Dave Palumbo (APP_ID: MjAxODA0MDMxMDM3Mjc=)
UPDATE public.profiles SET
  full_name = 'Dave Palumbo',
  username = 'davepalumbo',
  avatar_url = 'https://images.squarespace-cdn.com/content/v1/5c4e0b8a85ede1a5a1b0f43f/1548690124219-8F3U3VXQG9EWNQLPFZ0T/Dave+Palumbo.jpg'
WHERE id = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';

UPDATE public.creator_profiles SET
  bio = 'Professional bodybuilder, nutritionist, and founder of RXMuscle.com. With decades of experience in competitive bodybuilding and sports nutrition, I provide science-based guidance on contest prep, nutrition protocols, and training methodologies.',
  tagline = 'Science-Based Bodybuilding & Nutrition',
  subscription_price_cents = 2499,
  is_featured = true,
  subscriber_count = 1890,
  social_links = '{
    "instagram": "https://instagram.com/davepalumbo_",
    "youtube": "https://youtube.com/@rxmuscle",
    "twitter": "https://twitter.com/RxMuscle",
    "website": "https://rxmuscle.com"
  }'::jsonb
WHERE user_id = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';

-- Add banner images
ALTER TABLE public.creator_profiles ADD COLUMN IF NOT EXISTS banner_url TEXT;

UPDATE public.creator_profiles SET
  banner_url = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=400&fit=crop'
WHERE user_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

UPDATE public.creator_profiles SET
  banner_url = 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&h=400&fit=crop'
WHERE user_id = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';
