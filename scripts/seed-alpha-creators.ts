/**
 * Seed Alpha Creators
 *
 * Seeds the database with known Alpha creators (Mike Davies, Dave Palumbo, etc.)
 * using publicly available information from iamanalpha.com
 *
 * Usage:
 *   SUPABASE_SERVICE_KEY=<key> npx tsx scripts/seed-alpha-creators.ts
 */

import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xigukyglicivnvsloshg.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || ''

if (!SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_SERVICE_KEY environment variable is required')
  console.error('Get it from: https://supabase.com/dashboard/project/xigukyglicivnvsloshg/settings/api')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Known Alpha creators with their public information
const ALPHA_CREATORS = [
  {
    email: 'mike@iamanalpha.com',
    full_name: 'Mike Davies',
    username: 'mikedavies',
    avatar_url: 'https://images.squarespace-cdn.com/content/v1/5c4e0b8a85ede1a5a1b0f43f/1548688539419-LQHQZ0N8LQY1TLXJLZQZ/Mike+Davies.jpg',
    bio: 'Founder & CEO of Alpha. Former professional bodybuilder, entrepreneur, and coach with over 20 years of experience in fitness and business development.',
    tagline: 'We Empower Alphas',
    category_slug: 'bodybuilding',
    subscription_price_cents: 2999,
    is_featured: true,
    social_links: {
      instagram: 'https://instagram.com/mikedaviesfit',
      twitter: 'https://twitter.com/mikedaviesfit',
      youtube: 'https://youtube.com/@mikedaviesfit',
    },
  },
  {
    email: 'dave@iamanalpha.com',
    full_name: 'Dave Palumbo',
    username: 'davepalumbo',
    avatar_url: 'https://images.squarespace-cdn.com/content/v1/5c4e0b8a85ede1a5a1b0f43f/1548690124219-8F3U3VXQG9EWNQLPFZ0T/Dave+Palumbo.jpg',
    bio: 'Professional bodybuilder, nutritionist, and founder of RXMuscle.com. Known for expertise in contest prep, nutrition protocols, and training science.',
    tagline: 'Science-Based Bodybuilding',
    category_slug: 'bodybuilding',
    subscription_price_cents: 2499,
    is_featured: true,
    social_links: {
      instagram: 'https://instagram.com/davepalumbo',
      youtube: 'https://youtube.com/@rxmuscle',
    },
  },
  {
    email: 'trainer1@iamanalpha.com',
    full_name: 'Alpha Fitness Coach',
    username: 'alphafitness',
    avatar_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop',
    bio: 'Certified personal trainer specializing in strength training, HIIT, and functional fitness. Transform your body and mindset.',
    tagline: 'Train Like an Alpha',
    category_slug: 'fitness',
    subscription_price_cents: 1999,
    is_featured: false,
    social_links: {
      instagram: 'https://instagram.com/alphafitness',
    },
  },
  {
    email: 'nutrition@iamanalpha.com',
    full_name: 'Alpha Nutrition Expert',
    username: 'alphanutrition',
    avatar_url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=400&fit=crop',
    bio: 'Registered dietitian and sports nutritionist. Custom meal plans, macro coaching, and evidence-based nutrition advice.',
    tagline: 'Fuel Your Alpha',
    category_slug: 'nutrition',
    subscription_price_cents: 1499,
    is_featured: false,
    social_links: {
      instagram: 'https://instagram.com/alphanutrition',
    },
  },
]

async function seedCreators() {
  console.log('='.repeat(50))
  console.log('Alpha Creators Seeding Script')
  console.log('='.repeat(50))
  console.log()

  // First, get category IDs
  console.log('Fetching categories...')
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, slug')

  if (catError) {
    console.error('Error fetching categories:', catError)
    process.exit(1)
  }

  const categoryMap = new Map(categories?.map((c) => [c.slug, c.id]) || [])
  console.log(`Found ${categoryMap.size} categories`)

  for (const creator of ALPHA_CREATORS) {
    console.log(`\nProcessing ${creator.full_name}...`)

    // Check if user already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', creator.email)
      .single()

    if (existingProfile) {
      console.log(`  User already exists, skipping...`)
      continue
    }

    // Create auth user using admin API
    console.log(`  Creating auth user...`)
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: creator.email,
      password: `Alpha2024!${creator.username}`, // Temporary password
      email_confirm: true,
      user_metadata: {
        full_name: creator.full_name,
      },
    })

    if (authError) {
      console.error(`  Error creating auth user: ${authError.message}`)
      continue
    }

    console.log(`  Auth user created: ${authUser.user.id}`)

    // Wait for trigger to create profile
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Update profile with additional info
    console.log(`  Updating profile...`)
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        username: creator.username,
        avatar_url: creator.avatar_url,
        role: 'creator',
      })
      .eq('id', authUser.user.id)

    if (profileError) {
      console.error(`  Error updating profile: ${profileError.message}`)
    }

    // Create creator profile
    console.log(`  Creating creator profile...`)
    const categoryId = categoryMap.get(creator.category_slug)

    const { error: creatorError } = await supabase.from('creator_profiles').insert({
      user_id: authUser.user.id,
      bio: creator.bio,
      tagline: creator.tagline,
      category_id: categoryId,
      subscription_price_cents: creator.subscription_price_cents,
      is_featured: creator.is_featured,
      is_active: true,
      social_links: creator.social_links,
    })

    if (creatorError) {
      console.error(`  Error creating creator profile: ${creatorError.message}`)
    } else {
      console.log(`  Creator profile created successfully!`)
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log('Seeding complete!')
  console.log('='.repeat(50))
}

seedCreators().catch(console.error)
