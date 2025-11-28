export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Enums
export type UserRole = 'fan' | 'creator' | 'admin'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'incomplete'
export type PostVisibility = 'public' | 'subscribers_only'

// Database Schema
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          username: string | null
          avatar_url: string | null
          role: UserRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          username?: string | null
          avatar_url?: string | null
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          username?: string | null
          avatar_url?: string | null
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
      }
      creator_profiles: {
        Row: {
          id: string
          user_id: string
          bio: string | null
          tagline: string | null
          banner_url: string | null
          category_id: string | null
          subscription_price_cents: number
          stripe_account_id: string | null
          stripe_onboarding_complete: boolean
          subscriber_count: number
          is_featured: boolean
          is_active: boolean
          social_links: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          bio?: string | null
          tagline?: string | null
          banner_url?: string | null
          category_id?: string | null
          subscription_price_cents?: number
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean
          subscriber_count?: number
          is_featured?: boolean
          is_active?: boolean
          social_links?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          bio?: string | null
          tagline?: string | null
          banner_url?: string | null
          category_id?: string | null
          subscription_price_cents?: number
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean
          subscriber_count?: number
          is_featured?: boolean
          is_active?: boolean
          social_links?: Json
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          subscriber_id: string
          creator_id: string
          stripe_subscription_id: string | null
          stripe_customer_id: string | null
          status: SubscriptionStatus
          current_period_start: string | null
          current_period_end: string | null
          canceled_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          subscriber_id: string
          creator_id: string
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          status?: SubscriptionStatus
          current_period_start?: string | null
          current_period_end?: string | null
          canceled_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          subscriber_id?: string
          creator_id?: string
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          status?: SubscriptionStatus
          current_period_start?: string | null
          current_period_end?: string | null
          canceled_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          creator_id: string
          title: string
          content: string | null
          media_urls: string[]
          visibility: PostVisibility
          is_pinned: boolean
          like_count: number
          comment_count: number
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          title: string
          content?: string | null
          media_urls?: string[]
          visibility?: PostVisibility
          is_pinned?: boolean
          like_count?: number
          comment_count?: number
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          title?: string
          content?: string | null
          media_urls?: string[]
          visibility?: PostVisibility
          is_pinned?: boolean
          like_count?: number
          comment_count?: number
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      post_likes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          icon: string | null
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          icon?: string | null
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          icon?: string | null
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          creator_id: string
          subscriber_id: string
          last_message_at: string
          last_message_preview: string | null
          creator_unread_count: number
          subscriber_unread_count: number
          is_archived_by_creator: boolean
          is_archived_by_subscriber: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          subscriber_id: string
          last_message_at?: string
          last_message_preview?: string | null
          creator_unread_count?: number
          subscriber_unread_count?: number
          is_archived_by_creator?: boolean
          is_archived_by_subscriber?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          subscriber_id?: string
          last_message_at?: string
          last_message_preview?: string | null
          creator_unread_count?: number
          subscriber_unread_count?: number
          is_archived_by_creator?: boolean
          is_archived_by_subscriber?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          is_read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: UserRole
      subscription_status: SubscriptionStatus
      post_visibility: PostVisibility
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type Insertable<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type Updatable<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Convenient type exports
export type Profile = Tables<'profiles'>
export type CreatorProfile = Tables<'creator_profiles'>
export type Subscription = Tables<'subscriptions'>
export type Post = Tables<'posts'>
export type PostLike = Tables<'post_likes'>
export type Category = Tables<'categories'>
export type Conversation = Tables<'conversations'>
export type Message = Tables<'messages'>
