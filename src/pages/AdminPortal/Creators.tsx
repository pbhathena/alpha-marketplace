import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search, ExternalLink, Check, X } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { Link } from 'react-router-dom'

export default function Creators() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Fetch creators with their profiles
  const { data: creators, isLoading } = useQuery({
    queryKey: ['admin-creators'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('creator_profiles')
        .select(`
          *,
          profile:user_id (
            id,
            full_name,
            username,
            email,
            avatar_url,
            created_at
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
  })

  const filteredCreators = creators?.filter((creator: any) => {
    // Status filter
    if (statusFilter === 'active' && !creator.is_active) return false
    if (statusFilter === 'inactive' && creator.is_active) return false
    if (statusFilter === 'featured' && !creator.is_featured) return false
    if (statusFilter === 'stripe_pending' && creator.stripe_onboarding_complete) return false

    // Search filter
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      creator.profile?.full_name?.toLowerCase().includes(searchLower) ||
      creator.profile?.email?.toLowerCase().includes(searchLower) ||
      creator.profile?.username?.toLowerCase().includes(searchLower) ||
      creator.tagline?.toLowerCase().includes(searchLower)
    )
  })

  const getInitials = (name: string | null) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Creators</h2>
        <p className="text-muted-foreground">
          Manage creators and their profiles
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search creators..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'all', label: 'All' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'featured', label: 'Featured' },
                { value: 'stripe_pending', label: 'Stripe Pending' },
              ].map((filter) => (
                <Button
                  key={filter.value}
                  variant={statusFilter === filter.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(filter.value)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Creators Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Creators ({filteredCreators?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Creator</TableHead>
                <TableHead>Subscribers</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Stripe</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCreators && filteredCreators.length > 0 ? (
                filteredCreators.map((creator: any) => (
                  <TableRow key={creator.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={creator.profile?.avatar_url || undefined} />
                          <AvatarFallback>{getInitials(creator.profile?.full_name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{creator.profile?.full_name || 'No name'}</p>
                          <p className="text-sm text-muted-foreground">
                            @{creator.profile?.username || 'no-username'}
                          </p>
                          {creator.tagline && (
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {creator.tagline}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">{creator.subscriber_count}</span>
                    </TableCell>
                    <TableCell>
                      ${(creator.subscription_price_cents / 100).toFixed(2)}/mo
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {creator.is_active ? (
                          <Badge variant="default" className="bg-green-500">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                        {creator.is_featured && (
                          <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {creator.stripe_onboarding_complete ? (
                        <span className="flex items-center gap-1 text-green-500">
                          <Check className="h-4 w-4" />
                          Connected
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-yellow-500">
                          <X className="h-4 w-4" />
                          Pending
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Link to={`/creator/${creator.profile?.username}`} target="_blank">
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No creators found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
