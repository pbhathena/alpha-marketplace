#!/usr/bin/env node
/**
 * Create Demo Users Script v3
 * Uses signUp method (same as website signup)
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing environment variables!')
  process.exit(1)
}

// Use anon client for signups (same as website)
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpZ3VreWdsaWNpdm52c2xvc2hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNDU0MzAsImV4cCI6MjA3OTgyMTQzMH0.OCBDQ2B4SPH71X9ROV_1D7c2qZYBdFjQC-kHLzM4Y6Y'

const anonClient = createClient(SUPABASE_URL, anonKey)
const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

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
    console.log(`Processing ${user.email}...`)

    // Try to sign up
    const { data: signUpData, error: signUpError } = await anonClient.auth.signUp({
      email: user.email,
      password: user.password,
      options: {
        data: {
          full_name: user.full_name
        }
      }
    })

    if (signUpError) {
      console.log(`  Signup error: ${signUpError.message}`)

      // If user exists, try to sign in to get their ID
      const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
        email: user.email,
        password: user.password
      })

      if (signInError) {
        console.log(`  SignIn error: ${signInError.message}`)
        continue
      }

      const userId = signInData.user.id
      console.log(`  Existing user: ${userId}`)

      // Update their role using service client
      const { error: updateError } = await serviceClient
        .from('profiles')
        .update({
          role: user.role,
          full_name: user.full_name,
          username: user.username
        })
        .eq('id', userId)

      if (updateError) {
        console.log(`  Update error: ${updateError.message}`)
      } else {
        console.log(`  Updated role to: ${user.role}`)
      }

      continue
    }

    if (signUpData.user) {
      const userId = signUpData.user.id
      console.log(`  Created user: ${userId}`)

      // Wait a bit for trigger to create profile
      await new Promise(r => setTimeout(r, 1000))

      // Update role using service client
      const { error: updateError } = await serviceClient
        .from('profiles')
        .update({
          role: user.role,
          full_name: user.full_name,
          username: user.username
        })
        .eq('id', userId)

      if (updateError) {
        console.log(`  Update error: ${updateError.message}`)
      } else {
        console.log(`  Updated role to: ${user.role}`)
      }

      // Create creator profile if needed
      if (user.role === 'creator') {
        const { error: creatorError } = await serviceClient
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
          console.log(`  Created creator profile`)
        }
      }
    } else {
      console.log(`  User needs email confirmation (check inbox or disable in Supabase dashboard)`)
    }

    console.log('')
  }

  // Verify
  console.log('\nVerifying accounts...')
  const { data: profiles } = await serviceClient
    .from('profiles')
    .select('email, role, username')
    .in('email', ['fan@demo.com', 'creator@demo.com', 'admin@demo.com'])

  if (profiles && profiles.length > 0) {
    console.log('\nCreated profiles:')
    profiles.forEach(p => console.log(`  ${p.email} - ${p.role} (@${p.username})`))
  }

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
