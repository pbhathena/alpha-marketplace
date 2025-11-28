#!/usr/bin/env node
/**
 * Create Demo Users Script
 *
 * This script creates demo users for testing all three portals:
 * - fan@demo.com (Fan role) - for Patron Dashboard
 * - creator@demo.com (Creator role) - for Creator Dashboard
 * - admin@demo.com (Admin role) - for Admin Portal
 *
 * All passwords: demo123
 *
 * Usage:
 *   SUPABASE_URL=your-url SUPABASE_SERVICE_KEY=your-key node scripts/create-demo-users.mjs
 *
 * Get your service key from: Supabase Dashboard > Settings > API > service_role key
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing environment variables!')
  console.error('Usage: SUPABASE_URL=xxx SUPABASE_SERVICE_KEY=xxx node scripts/create-demo-users.mjs')
  console.error('')
  console.error('Get your service key from: Supabase Dashboard > Settings > API > service_role key')
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

  for (const user of demoUsers) {
    console.log(`Creating ${user.email}...`)

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        full_name: user.full_name
      }
    })

    if (authError) {
      if (authError.message.includes('already been registered')) {
        console.log(`  User already exists, updating role...`)

        // Get existing user
        const { data: existingUsers } = await supabase.auth.admin.listUsers()
        const existingUser = existingUsers?.users?.find(u => u.email === user.email)

        if (existingUser) {
          // Update profile role
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              role: user.role,
              full_name: user.full_name,
              username: user.username
            })
            .eq('id', existingUser.id)

          if (updateError) {
            console.log(`  Error updating: ${updateError.message}`)
          } else {
            console.log(`  Updated role to: ${user.role}`)
          }
        }
        continue
      }
      console.log(`  Error: ${authError.message}`)
      continue
    }

    const userId = authData.user.id
    console.log(`  Created auth user: ${userId}`)

    // Update profile with role and username
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        role: user.role,
        full_name: user.full_name,
        username: user.username
      })
      .eq('id', userId)

    if (profileError) {
      console.log(`  Error updating profile: ${profileError.message}`)
    } else {
      console.log(`  Set role: ${user.role}`)
    }

    // Create creator profile if creator
    if (user.role === 'creator') {
      const { error: creatorError } = await supabase
        .from('creator_profiles')
        .insert({
          user_id: userId,
          tagline: 'Demo Creator Account',
          bio: 'This is a demo creator account for testing purposes.',
          subscription_price_cents: 999,
          is_active: true,
          stripe_onboarding_complete: true
        })

      if (creatorError) {
        console.log(`  Error creating creator profile: ${creatorError.message}`)
      } else {
        console.log(`  Created creator profile`)
      }
    }

    console.log('')
  }

  console.log('Done! Demo accounts created:\n')
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
