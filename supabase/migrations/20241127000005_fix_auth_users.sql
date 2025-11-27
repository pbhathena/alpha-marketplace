-- Fix auth users that were incorrectly inserted
-- Delete the broken entries from auth.users and let the proper signup flow create them

-- First, delete from creator_profiles (child)
DELETE FROM public.creator_profiles WHERE user_id IN (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  'c3d4e5f6-a7b8-9012-cdef-123456789012',
  'd4e5f6a7-b8c9-0123-def0-234567890123'
);

-- Then delete from profiles (child of auth.users)
DELETE FROM public.profiles WHERE id IN (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  'c3d4e5f6-a7b8-9012-cdef-123456789012',
  'd4e5f6a7-b8c9-0123-def0-234567890123'
);

-- Finally delete from auth.users (parent)
DELETE FROM auth.users WHERE id IN (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  'c3d4e5f6-a7b8-9012-cdef-123456789012',
  'd4e5f6a7-b8c9-0123-def0-234567890123'
);
