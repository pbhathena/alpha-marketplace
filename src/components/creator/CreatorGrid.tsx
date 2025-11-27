import { CreatorCard } from './CreatorCard'
import { Card } from '@/components/ui/card'
import type { CreatorProfile, Profile, Category } from '@/types/database'

interface CreatorGridProps {
  creators: Array<
    CreatorProfile & {
      profiles: Profile
      category?: Category
    }
  >
  loading?: boolean
}

function CreatorSkeleton() {
  return (
    <Card className="overflow-hidden">
      {/* Banner skeleton */}
      <div className="h-32 bg-muted animate-pulse" />

      <div className="relative px-4 pb-4">
        {/* Avatar skeleton */}
        <div className="mb-3 -mt-8">
          <div className="h-16 w-16 rounded-full bg-muted border-4 border-background animate-pulse" />
        </div>

        {/* Content skeleton */}
        <div className="space-y-2">
          <div className="space-y-1">
            <div className="h-6 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="h-4 w-full bg-muted rounded animate-pulse" />
            <div className="h-4 w-4/5 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-5 w-20 bg-muted rounded-full animate-pulse" />
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="h-5 w-16 bg-muted rounded animate-pulse" />
            <div className="h-6 w-20 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    </Card>
  )
}

export function CreatorGrid({ creators, loading = false }: CreatorGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <CreatorSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (creators.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="rounded-full bg-primary/10 p-6 mb-4">
          <svg
            className="h-12 w-12 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2 text-white">Be the First Alpha!</h3>
        <p className="text-muted-foreground max-w-md mb-6">
          No creators have joined yet. Be among the first to share your expertise and build your community on Alpha.
        </p>
        <a
          href="/become-creator"
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-white font-medium hover:bg-primary/90 transition-colors"
        >
          Become an Alpha
        </a>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {creators.map((creator) => {
        // Use username field, fallback to email prefix, then ID
        const username =
          creator.profiles.username ||
          creator.profiles.email?.split('@')[0] ||
          creator.id.slice(0, 8)
        return <CreatorCard key={creator.id} creator={creator} username={username} />
      })}
    </div>
  )
}
