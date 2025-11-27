import { Link } from 'react-router-dom'
import { Users } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import type { CreatorProfile, Profile, Category } from '@/types/database'

interface CreatorCardProps {
  creator: CreatorProfile & {
    profiles: Profile
    category?: Category
  }
  username: string
}

export function CreatorCard({ creator, username }: CreatorCardProps) {
  const displayName = creator.profiles.full_name || creator.profiles.username || 'Creator'
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // Generate a consistent gradient based on the creator ID - Alpha red theme
  const gradientIndex = parseInt(creator.id.slice(0, 8), 16) % 5
  const gradients = [
    'bg-gradient-to-br from-primary to-primary-light',
    'bg-gradient-to-br from-primary-dark to-primary',
    'bg-gradient-to-br from-primary/80 to-primary-light',
    'bg-gradient-to-br from-primary to-alpha-accent',
    'bg-gradient-to-br from-primary-dark to-primary-light',
  ]

  return (
    <Link to={`/creator/${username}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02]">
        {/* Banner */}
        <div className="relative h-32">
          {creator.banner_url ? (
            <img
              src={creator.banner_url}
              alt={`${displayName} banner`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className={`h-full w-full ${gradients[gradientIndex]}`} />
          )}
        </div>

        {/* Content */}
        <div className="relative px-4 pb-4">
          {/* Avatar overlapping banner */}
          <div className="mb-3 -mt-8">
            <Avatar className="h-16 w-16 border-4 border-background">
              <AvatarImage
                src={creator.profiles.avatar_url || undefined}
                alt={displayName}
              />
              <AvatarFallback className="text-lg font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Creator info */}
          <div className="space-y-2">
            <div>
              <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
                {displayName}
              </h3>
              <p className="text-sm text-muted-foreground">@{username}</p>
            </div>

            {/* Tagline */}
            {creator.bio && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {creator.bio}
              </p>
            )}

            {/* Category badge */}
            {creator.category && (
              <Badge variant="secondary" className="text-xs">
                {creator.category.name}
              </Badge>
            )}

            {/* Stats and price */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{creator.subscriber_count.toLocaleString()}</span>
              </div>
              <div className="text-lg font-bold">
                ${(creator.subscription_price_cents / 100).toFixed(2)}
                <span className="text-xs text-muted-foreground font-normal">
                  /mo
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
