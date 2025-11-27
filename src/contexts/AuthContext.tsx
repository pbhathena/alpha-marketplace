import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import type { Profile, CreatorProfile } from '@/types/database'
import { DEMO_CREATORS } from '@/data/demoContent'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  creatorProfile: CreatorProfile | null
  isLoading: boolean
  isCreator: boolean
  isAdmin: boolean
  isDemoMode: boolean
  demoCreators: typeof DEMO_CREATORS | null
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [demoCreators, setDemoCreators] = useState<typeof DEMO_CREATORS | null>(null)

  const isCreator = profile?.role === 'creator' || isDemoMode
  const isAdmin = profile?.role === 'admin'

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      const profileData = data as Profile
      setProfile(profileData)

      // If user is a creator, fetch creator profile
      if (profileData?.role === 'creator') {
        await fetchCreatorProfile(userId)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setProfile(null)
    }
  }

  // Fetch creator profile
  const fetchCreatorProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('creator_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      setCreatorProfile(data)
    } catch (error) {
      console.error('Error fetching creator profile:', error)
      setCreatorProfile(null)
    }
  }

  // Refresh profile data
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  // Sign up
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) return { error }

      // Profile will be created by database trigger
      return { error: null }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  // Sign in
  const signIn = async (email: string, password: string) => {
    // Check for demo login
    if (email.toLowerCase() === 'demo' && password === 'demo') {
      // Set demo mode with both creators
      setIsDemoMode(true)
      setDemoCreators(DEMO_CREATORS)

      // Create a mock profile for Mike Davies (primary demo user)
      const mikeData = DEMO_CREATORS.mikedavies
      const mockProfile: Profile = {
        id: mikeData.id,
        email: mikeData.email,
        full_name: mikeData.full_name,
        username: mikeData.username,
        avatar_url: mikeData.avatar_url,
        role: 'creator',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const mockCreatorProfile: CreatorProfile = {
        id: mikeData.id,
        user_id: mikeData.id,
        bio: mikeData.bio,
        tagline: mikeData.tagline,
        banner_url: mikeData.banner_url,
        category_id: null,
        subscription_price_cents: mikeData.subscription_price_cents,
        stripe_account_id: null,
        stripe_onboarding_complete: false,
        subscriber_count: mikeData.subscriber_count,
        is_featured: true,
        is_active: true,
        social_links: {
          instagram: 'https://instagram.com/mikedaviesfitness',
          youtube: 'https://youtube.com/@mikedaviesfitness',
          website: 'https://iamanalpha.com'
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Create a mock user object
      const mockUser = {
        id: mikeData.id,
        email: mikeData.email,
        app_metadata: {},
        user_metadata: { full_name: mikeData.full_name },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as unknown as User

      setUser(mockUser)
      setProfile(mockProfile)
      setCreatorProfile(mockCreatorProfile)
      setIsLoading(false)

      return { error: null }
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  // Sign out
  const signOut = async () => {
    if (!isDemoMode) {
      await supabase.auth.signOut()
    }
    setUser(null)
    setSession(null)
    setProfile(null)
    setCreatorProfile(null)
    setIsDemoMode(false)
    setDemoCreators(null)
  }

  // Initialize auth state and listen for changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      }
      setIsLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setCreatorProfile(null)
      }
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const value = {
    user,
    session,
    profile,
    creatorProfile,
    isLoading,
    isCreator,
    isAdmin,
    isDemoMode,
    demoCreators,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
