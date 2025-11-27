-- Alpha Marketplace Seed Data
-- Run this after the initial migration to populate categories

-- =====================
-- CATEGORIES
-- =====================
INSERT INTO public.categories (id, name, slug, description, icon, display_order) VALUES
  (gen_random_uuid(), 'Fitness & Training', 'fitness', 'Personal training, workout programs, and fitness coaching', '💪', 1),
  (gen_random_uuid(), 'Bodybuilding', 'bodybuilding', 'Competitive bodybuilding, physique coaching, and muscle building', '🏋️', 2),
  (gen_random_uuid(), 'Nutrition & Diet', 'nutrition', 'Meal planning, nutrition coaching, and dietary guidance', '🥗', 3),
  (gen_random_uuid(), 'Business & Entrepreneurship', 'business', 'Business coaching, entrepreneurship, and career development', '💼', 4),
  (gen_random_uuid(), 'Lifestyle & Wellness', 'lifestyle', 'Holistic wellness, life coaching, and personal development', '🌟', 5),
  (gen_random_uuid(), 'Education & Learning', 'education', 'Educational content, courses, and skill development', '📚', 6),
  (gen_random_uuid(), 'Sports & Athletics', 'sports', 'Sports performance, athletic training, and competition prep', '⚽', 7),
  (gen_random_uuid(), 'Creative Arts', 'creative', 'Photography, videography, music, and creative skills', '🎨', 8)
ON CONFLICT (slug) DO NOTHING;

-- Note: Creator profiles (Mike Davies, Dave Palumbo, etc.) will be created
-- when they sign up through the app. The signup flow creates:
-- 1. auth.users record (via Supabase Auth)
-- 2. public.profiles record (via database trigger)
-- 3. public.creator_profiles record (via the become-creator flow)
