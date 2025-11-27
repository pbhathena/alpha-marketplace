-- Seed Demo Creators for Alpha Marketplace
-- This creates demo data to show how the platform works

-- First, we need to create auth users, but since we can't do that via SQL migrations,
-- we'll create a workaround by inserting directly into profiles with generated UUIDs
-- and then create creator_profiles referencing them.

-- Note: In production, creators would be created through the normal signup flow.
-- This is just for demo purposes.

-- Get category IDs
DO $$
DECLARE
  bodybuilding_id UUID;
  fitness_id UUID;
  nutrition_id UUID;
  mike_id UUID := gen_random_uuid();
  dave_id UUID := gen_random_uuid();
  alex_id UUID := gen_random_uuid();
  sarah_id UUID := gen_random_uuid();
BEGIN
  -- Get category IDs
  SELECT id INTO bodybuilding_id FROM categories WHERE slug = 'bodybuilding';
  SELECT id INTO fitness_id FROM categories WHERE slug = 'fitness';
  SELECT id INTO nutrition_id FROM categories WHERE slug = 'nutrition';

  -- Insert demo profiles (bypassing auth.users FK for demo)
  -- Note: These won't have real auth, just for display

  -- First, temporarily disable the FK check
  -- We can't really do this in Supabase, so we need another approach

  RAISE NOTICE 'Demo seeding requires service role access. Please run seed-alpha-creators.ts script instead.';
END $$;

-- Alternative: Just seed additional categories if needed
INSERT INTO categories (name, slug, description, icon, display_order)
VALUES
  ('Mindset & Motivation', 'mindset', 'Mental strength, motivation, and mindset coaching', '🧠', 9),
  ('Combat Sports', 'combat', 'Boxing, MMA, wrestling, and martial arts', '🥊', 10),
  ('Endurance Training', 'endurance', 'Marathon, triathlon, and endurance sports', '🏃‍♂️', 11),
  ('Recovery & Mobility', 'recovery', 'Stretching, mobility work, and recovery techniques', '🧘‍♂️', 12)
ON CONFLICT (slug) DO NOTHING;
