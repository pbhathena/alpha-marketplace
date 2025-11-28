#!/usr/bin/env node
/**
 * Create Demo Users Script v2
 * Uses signUp method with auto-confirm
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing environment variables!')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const demoUsers = [
  {
    email: 'fan@demo.com',
    password: 'demo123',
    role: 'fan',
    full_name: 'Demo Fan',
    username: 'demofan'
  },
  {
    email: 'creator@demo.com',
    password: 'demo123',
    role: 'creator',
    full_name: 'Demo Creator',
    username: 'democreator'
  },
  {
    email: 'admin@demo.com',
    password: 'demo123',
    role: 'admin',
    full_name: 'Demo Admin',
    username: 'demoadmin'
  }
]

async function createDemoUsers() {
  console.log('Creating demo users...\n')

  // First check if users exist
  const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers()

  if (listError) {
    console.error('Error listing users:', listError.message)
    return
  }

  console.log(`Found ${existingUsers.users.length} existing users\n`)

  for (const user of demoUsers) {
    console.log(`Processing ${user.email}...`)

    // Check if user already exists
    const existingUser = existingUsers.users.find(u => u.email === user.email)

    let userId

    if (existingUser) {
      console.log(`  User exists with ID: ${existingUser.id}`)
      userId = existingUser.id
    } else {
      // Create new user with admin API
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.full_name
        }
      })

      if (authError) {
        console.log(`  Error creating user: ${authError.message}`)
        continue
      }

      userId = authData.user.id
      console.log(`  Created user with ID: ${userId}`)
    }

    // Update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        role: user.role,
        full_name: user.full_name,
        username: user.username
      })
      .eq('id', userId)

    if (profileError) {
      console.log(`  Profile update error: ${profileError.message}`)

      // Try insert if update fails
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: user.email,
          role: user.role,
          full_name: user.full_name,
          username: user.username
        })

      if (insertError) {
        console.log(`  Profile insert error: ${insertError.message}`)
      } else {
        console.log(`  Created profile with role: ${user.role}`)
      }
    } else {
      console.log(`  Updated role to: ${user.role}`)
    }

    // Create creator profile if creator
    if (user.role === 'creator') {
      const { error: creatorError } = await supabase
        .from('creator_profiles')
        .upsert({
          user_id: userId,
          tagline: 'Demo Creator Account',
          bio: 'This is a demo creator account for testing purposes.',
          subscription_price_cents: 999,
          is_active: true,
          stripe_onboarding_complete: true
        }, { onConflict: 'user_id' })

      if (creatorError) {
        console.log(`  Creator profile error: ${creatorError.message}`)
      } else {
        console.log(`  Created/updated creator profile`)
      }
    }

    console.log('')
  }

  // Verify
  console.log('Verifying accounts...\n')
  const { data: profiles } = await supabase
    .from('profiles')
    .select('email, role, username, full_name')
    .in('email', ['fan@demo.com', 'creator@demo.com', 'admin@demo.com'])

  console.log('Profiles:', profiles)

  console.log('\n')
  console.log('┌─────────────────────────────────────────────────────────────┐')
  console.log('│ Portal            │ Email              │ Password │ Role    │')
  console.log('├─────────────────────────────────────────────────────────────┤')
  console.log('│ Patron Dashboard  │ fan@demo.com       │ demo123  │ fan     │')
  console.log('│ Creator Dashboard │ creator@demo.com   │ demo123  │ creator │')
  console.log('│ Admin Portal      │ admin@demo.com     │ demo123  │ admin   │')
  console.log('└─────────────────────────────────────────────────────────────┘')
  console.log('')
  console.log('URLs:')
  console.log('  Patron:  https://alpha-marketplace-kappa.vercel.app/my-account')
  console.log('  Creator: https://alpha-marketplace-kappa.vercel.app/dashboard')
  console.log('  Admin:   https://alpha-marketplace-kappa.vercel.app/admin')
}

createDemoUsers().catch(console.error)
