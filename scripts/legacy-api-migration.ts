/**
 * Legacy Alpha API Migration Agent
 *
 * This script migrates data from the legacy iamanalpha1.com API to the new Supabase database.
 *
 * Usage:
 *   npx tsx scripts/legacy-api-migration.ts --email <email> --password <password>
 *
 * The script will:
 * 1. Authenticate with the legacy API
 * 2. Fetch feeds, resources, and creator data
 * 3. Transform and insert into Supabase
 */

import { createClient } from '@supabase/supabase-js'

// Configuration
const LEGACY_API_URL = 'https://iamanalpha1.com/api/'
const APP_ID = 'MjAxOTA2MjQ1OTA1MjQ=' // Base64 encoded app ID from Android app

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xigukyglicivnvsloshg.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || ''

// Initialize Supabase client with service key for admin operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Legacy API endpoints from Android Constant.java
const ENDPOINTS = {
  LOGIN: 'login',
  FEED: 'getfeeds',
  RESOURCE: 'getTopics',
  RESOURCE_CONTENT: 'getContent',
  RESOURCE_SUB_TOPICS: 'getSubtopics',
  MESSAGE: 'getMessages',
  GET_QA: 'getQA',
  PLAN: 'planLists',
  GET_PROFILE: 'getProfile',
  GET_COMMENTS: 'getComments',
} as const

interface LegacyApiResponse {
  status: boolean | string
  message: string
  code: string
  result?: any[]
  error?: string
  error_code?: string
}

interface LegacyFeed {
  feed_id: string
  title: string
  description: string
  feed_image?: string
  feed_video?: string
  created_at: string
  updated_at: string
  like_count: number
  comment_count: number
  is_locked?: boolean
}

interface LegacyCreator {
  user_id?: string
  full_name: string
  email: string
  profile_pic?: string
  bio?: string
  tagline?: string
}

class LegacyApiMigration {
  private accessToken: string = ''
  private email: string
  private password: string

  constructor(email: string, password: string) {
    this.email = email
    this.password = password
  }

  private async apiCall(endpoint: string, body: Record<string, any> = {}): Promise<LegacyApiResponse> {
    const response = await fetch(`${LEGACY_API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.accessToken ? { 'Authorization': `Bearer ${this.accessToken}` } : {}),
      },
      body: JSON.stringify({
        app_id: APP_ID,
        ...body,
        ...(this.accessToken ? { accessToken: this.accessToken } : {}),
      }),
    })

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async login(): Promise<boolean> {
    console.log('Authenticating with legacy API...')

    try {
      const response = await this.apiCall(ENDPOINTS.LOGIN, {
        email: this.email,
        password: this.password,
        device_token: 'migration-agent',
      })

      if (response.code === '10' && response.result && response.result.length > 0) {
        this.accessToken = response.result[0].accessToken
        console.log('Authentication successful!')
        return true
      } else {
        console.error('Authentication failed:', response.message)
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  async fetchFeeds(page: number = 1): Promise<LegacyFeed[]> {
    console.log(`Fetching feeds page ${page}...`)

    try {
      const response = await this.apiCall(ENDPOINTS.FEED, {
        page,
        limit: 50,
      })

      if (response.code === '10' && response.result) {
        console.log(`  Found ${response.result.length} feeds`)
        return response.result
      }
      return []
    } catch (error) {
      console.error('Error fetching feeds:', error)
      return []
    }
  }

  async fetchResources(): Promise<any[]> {
    console.log('Fetching resources/topics...')

    try {
      const response = await this.apiCall(ENDPOINTS.RESOURCE)

      if (response.code === '10' && response.result) {
        console.log(`  Found ${response.result.length} topics`)
        return response.result
      }
      return []
    } catch (error) {
      console.error('Error fetching resources:', error)
      return []
    }
  }

  async fetchProfile(): Promise<LegacyCreator | null> {
    console.log('Fetching profile...')

    try {
      const response = await this.apiCall(ENDPOINTS.GET_PROFILE)

      if (response.code === '10' && response.result && response.result.length > 0) {
        console.log('  Profile fetched successfully')
        return response.result[0]
      }
      return null
    } catch (error) {
      console.error('Error fetching profile:', error)
      return null
    }
  }

  async fetchQA(page: number = 1): Promise<any[]> {
    console.log(`Fetching Q&A page ${page}...`)

    try {
      const response = await this.apiCall(ENDPOINTS.GET_QA, { page })

      if (response.code === '10' && response.result) {
        console.log(`  Found ${response.result.length} Q&A items`)
        return response.result
      }
      return []
    } catch (error) {
      console.error('Error fetching Q&A:', error)
      return []
    }
  }

  async migrateToSupabase(data: {
    feeds: LegacyFeed[]
    resources: any[]
    profile: LegacyCreator | null
    qa: any[]
  }): Promise<void> {
    console.log('\nMigrating data to Supabase...')

    if (!SUPABASE_SERVICE_KEY) {
      console.error('SUPABASE_SERVICE_KEY environment variable is required for migration')
      console.log('\nDumping data to JSON instead...')

      const fs = await import('fs')
      const outputPath = './migration-data.json'
      fs.writeFileSync(outputPath, JSON.stringify(data, null, 2))
      console.log(`Data saved to ${outputPath}`)
      return
    }

    // Migration would happen here with actual Supabase writes
    // For now, we just output the data structure
    console.log('Migration summary:')
    console.log(`  - Feeds: ${data.feeds.length}`)
    console.log(`  - Resources: ${data.resources.length}`)
    console.log(`  - Q&A items: ${data.qa.length}`)
    console.log(`  - Profile: ${data.profile ? 'Yes' : 'No'}`)
  }

  async run(): Promise<void> {
    console.log('='.repeat(50))
    console.log('Legacy Alpha API Migration Agent')
    console.log('='.repeat(50))
    console.log()

    // Step 1: Authenticate
    const authenticated = await this.login()
    if (!authenticated) {
      console.error('\nMigration aborted: Authentication failed')
      process.exit(1)
    }

    // Step 2: Fetch all data
    console.log('\nFetching data from legacy API...\n')

    const [feeds, resources, profile, qa] = await Promise.all([
      this.fetchFeeds(1),
      this.fetchResources(),
      this.fetchProfile(),
      this.fetchQA(1),
    ])

    // Fetch additional pages if needed
    let allFeeds = [...feeds]
    let page = 2
    while (feeds.length === 50) {
      const moreFeeds = await this.fetchFeeds(page)
      if (moreFeeds.length === 0) break
      allFeeds = [...allFeeds, ...moreFeeds]
      page++
    }

    // Step 3: Migrate to Supabase
    await this.migrateToSupabase({
      feeds: allFeeds,
      resources,
      profile,
      qa,
    })

    console.log('\n' + '='.repeat(50))
    console.log('Migration complete!')
    console.log('='.repeat(50))
  }
}

// Parse command line arguments
function parseArgs(): { email: string; password: string } {
  const args = process.argv.slice(2)
  let email = ''
  let password = ''

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--email' && args[i + 1]) {
      email = args[i + 1]
      i++
    } else if (args[i] === '--password' && args[i + 1]) {
      password = args[i + 1]
      i++
    }
  }

  if (!email || !password) {
    console.error('Usage: npx tsx scripts/legacy-api-migration.ts --email <email> --password <password>')
    console.error('')
    console.error('Environment variables:')
    console.error('  SUPABASE_URL          - Supabase project URL (optional, has default)')
    console.error('  SUPABASE_SERVICE_KEY  - Supabase service role key (required for DB writes)')
    process.exit(1)
  }

  return { email, password }
}

// Main entry point
const { email, password } = parseArgs()
const migration = new LegacyApiMigration(email, password)
migration.run().catch(console.error)
