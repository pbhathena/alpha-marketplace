import { useState, useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowUpDown } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { SearchBar } from '@/components/creator/SearchBar'
import { CategoryFilter } from '@/components/creator/CategoryFilter'
import { CreatorGrid } from '@/components/creator/CreatorGrid'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { CreatorProfile, Profile, Category } from '@/types/database'
import { DEMO_CREATORS } from '@/data/demoContent'

type SortOption = 'popular' | 'newest' | 'price_low' | 'price_high'

const sortOptions = {
  popular: { label: 'Most Popular', column: 'subscriber_count', ascending: false },
  newest: { label: 'Newest', column: 'created_at', ascending: false },
  price_low: { label: 'Price: Low to High', column: 'subscription_price_cents', ascending: true },
  price_high: { label: 'Price: High to Low', column: 'subscription_price_cents', ascending: false },
}

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('popular')

  // Create demo creators data for display
  const demoCreatorsForGrid = useMemo(() => {
    return Object.values(DEMO_CREATORS).map((creator) => ({
      id: creator.id,
      user_id: creator.id,
      bio: creator.bio,
      tagline: creator.tagline,
      banner_url: creator.banner_url,
      category_id: null,
      subscription_price_cents: creator.subscription_price_cents,
      stripe_account_id: null,
      stripe_onboarding_complete: false,
      subscriber_count: creator.subscriber_count,
      is_featured: true,
      is_active: true,
      social_links: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profiles: {
        id: creator.id,
        email: creator.email,
        full_name: creator.full_name,
        username: creator.username,
        avatar_url: creator.avatar_url,
        role: 'creator' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      category: undefined,
    }))
  }, [])

  const { data: dbCreators, isLoading } = useQuery({
    queryKey: ['creators', searchQuery, selectedCategory, sortBy],
    queryFn: async () => {
      let query = supabase
        .from('creator_profiles')
        .select(`
          *,
          profiles!creator_profiles_user_id_fkey(
            id,
            email,
            full_name,
            username,
            avatar_url
          ),
          categories!creator_profiles_category_id_fkey(
            id,
            name,
            slug,
            icon
          )
        `)

      // Apply search filter
      if (searchQuery) {
        query = query.or(
          `bio.ilike.%${searchQuery}%,tagline.ilike.%${searchQuery}%`
        )
      }

      // Apply category filter
      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory)
      }

      // Apply sorting
      const sort = sortOptions[sortBy]
      query = query.order(sort.column, { ascending: sort.ascending })

      const { data, error } = await query

      if (error) throw error

      // Transform the data to match expected type
      return (data || []).map((creator: any) => ({
        ...creator,
        profiles: creator.profiles,
        category: creator.categories,
      })) as Array<
        CreatorProfile & {
          profiles: Profile
          category?: Category
        }
      >
    },
  })

  // Combine demo creators with database creators, avoiding duplicates
  const creators = useMemo(() => {
    const dbResults = dbCreators || []
    const dbIds = new Set(dbResults.map(c => c.user_id))

    // Filter demo creators by search query if present
    let filteredDemoCreators = demoCreatorsForGrid
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filteredDemoCreators = demoCreatorsForGrid.filter(c =>
        c.bio?.toLowerCase().includes(query) ||
        c.tagline?.toLowerCase().includes(query) ||
        c.profiles.full_name?.toLowerCase().includes(query)
      )
    }

    // Add demo creators that aren't already in DB results
    const demoToAdd = filteredDemoCreators.filter(c => !dbIds.has(c.user_id))

    // Combine and sort
    const combined = [...demoToAdd, ...dbResults]

    // Apply sorting
    const sort = sortOptions[sortBy]
    combined.sort((a, b) => {
      const aVal = a[sort.column as keyof typeof a] as number
      const bVal = b[sort.column as keyof typeof b] as number
      return sort.ascending ? aVal - bVal : bVal - aVal
    })

    return combined
  }, [dbCreators, demoCreatorsForGrid, searchQuery, sortBy])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  const handleCategoryChange = useCallback((categoryId: string | null) => {
    setSelectedCategory(categoryId)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background border-b">
        <div className="container py-12 md:py-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Discover Creators
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Support your favorite creators and get exclusive access to their
              content. Find creators across all categories.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="container py-6">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <SearchBar onSearch={handleSearch} />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="shrink-0">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    {sortOptions[sortBy].label}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {Object.entries(sortOptions).map(([key, option]) => (
                    <DropdownMenuItem
                      key={key}
                      onClick={() => setSortBy(key as SortOption)}
                      className={sortBy === key ? 'bg-accent' : ''}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Category Filter */}
            <CategoryFilter
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />
          </div>
        </div>
      </section>

      {/* Creator Grid */}
      <section className="container py-8">
        <CreatorGrid creators={creators || []} loading={isLoading} />
      </section>
    </div>
  )
}
