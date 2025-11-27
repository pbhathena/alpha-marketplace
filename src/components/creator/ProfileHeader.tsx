import { Twitter, Instagram, Youtube, Globe, Users } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { SubscribeButton } from './SubscribeButton'
import type { CreatorProfile, Profile } from '@/types/database'

interface ProfileHeaderProps {
  creator: Profile & { creator_profile: CreatorProfile }
  isSubscribed: boolean
  onSubscriptionChange?: () => void
}

interface SocialLinks {
  twitter?: string
  instagram?: string
  youtube?: string
  website?: string
}

export function ProfileHeader({ creator, isSubscribed, onSubscriptionChange }: ProfileHeaderProps) {
  const { creator_profile } = creator

  // Parse social links from JSON field
  const socialLinks: SocialLinks = (creator_profile.social_links as SocialLinks) || {}

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="w-full">
      {/* Banner */}
      <div className="relative h-48 md:h-64 w-full bg-gradient-to-r from-primary to-primary-light">
        {creator_profile.banner_url ? (
          <img
            src={creator_profile.banner_url}
            alt={`${creator.full_name} banner`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-primary to-primary-light" />
        )}
      </div>

      {/* Profile Info */}
      <div className="container px-4">
        <div className="relative -mt-16 md:-mt-20">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            {/* Avatar and Name */}
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <Avatar className="h-32 w-32 border-4 border-background">
                <AvatarImage src={creator.avatar_url ?? undefined} alt={creator.full_name ?? 'Creator'} />
                <AvatarFallback className="text-2xl">
                  {getInitials(creator.full_name ?? 'Creator')}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-2 pb-2">
                <div>
                  <h1 className="text-3xl font-bold">{creator.full_name}</h1>
                  <p className="text-muted-foreground">@{(creator.full_name ?? 'creator').toLowerCase().replace(/\s+/g, '')}</p>
                </div>

                {creator_profile.tagline && (
                  <p className="text-lg font-medium text-muted-foreground">{creator_profile.tagline}</p>
                )}

                {creator_profile.bio && (
                  <p className="text-base max-w-2xl">{creator_profile.bio}</p>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="secondary" className="gap-1">
                    <Users className="h-3 w-3" />
                    {creator_profile.subscriber_count} subscriber{creator_profile.subscriber_count !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Subscribe Button */}
            <div className="flex items-center gap-4 pb-2">
              <SubscribeButton
                creatorId={creator.id}
                creatorName={creator.full_name ?? 'Creator'}
                price={creator_profile.subscription_price_cents}
                isSubscribed={isSubscribed}
                onSubscriptionChange={onSubscriptionChange}
              />
            </div>
          </div>

          {/* Social Links */}
          {(socialLinks.twitter || socialLinks.instagram || socialLinks.youtube || socialLinks.website) && (
            <div className="mt-4 flex gap-4 pb-4">
              {socialLinks.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                  <span className="sr-only">Twitter</span>
                </a>
              )}
              {socialLinks.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                  <span className="sr-only">Instagram</span>
                </a>
              )}
              {socialLinks.youtube && (
                <a
                  href={socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Youtube className="h-5 w-5" />
                  <span className="sr-only">YouTube</span>
                </a>
              )}
              {socialLinks.website && (
                <a
                  href={socialLinks.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Globe className="h-5 w-5" />
                  <span className="sr-only">Website</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
