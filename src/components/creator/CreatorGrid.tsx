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
        <div className="rounded-full bg-muted p-6 mb-4">
          <svg
            className="h-12 w-12 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">No creators found</h3>
        <p className="text-muted-foreground max-w-md">
          Try adjusting your filters or search query to find creators.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {creators.map((creator) => {
        // Extract username from email or use a fallback
        const username =
          creator.profiles.email?.split('@')[0] || creator.id.slice(0, 8)
        return <CreatorCard key={creator.id} creator={creator} username={username} />
      })}
    </div>
  )
}
