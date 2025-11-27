import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, CheckCircle2, DollarSign, Users, Zap } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CreatorGrid } from '@/components/creator/CreatorGrid'
import { Badge } from '@/components/ui/badge'
import type { CreatorProfile, Profile, Category } from '@/types/database'

export default function Index() {
  // Fetch featured creators
  const { data: featuredCreators, isLoading: loadingFeatured } = useQuery({
    queryKey: ['featured-creators'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('creator_profiles')
        .select(`
          *,
          profiles!creator_profiles_user_id_fkey(
            id,
            email,
            full_name,
            avatar_url
          ),
          categories!creator_profiles_category_id_fkey(
            id,
            name,
            slug,
            icon
          )
        `)
        .eq('is_featured', true)
        .order('subscriber_count', { ascending: false })
        .limit(8)

      if (error) throw error

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

  // Fetch categories for preview
  const { data: categories } = useQuery({
    queryKey: ['categories-preview'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')
        .limit(6)

      if (error) throw error
      return data as Category[]
    },
  })

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-purple-500/10 to-pink-500/10">
        <div className="container py-16 md:py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4" variant="secondary">
              The Creator Economy Platform
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
              Support Creators.
              <br />
              Get Exclusive Content.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of fans supporting their favorite creators with
              monthly subscriptions. Get access to exclusive content, behind-the-scenes
              updates, and a direct connection to the creators you love.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/explore">
                  Explore Creators
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/signup">Become a Creator</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Creators */}
      {featuredCreators && featuredCreators.length > 0 && (
        <section className="container py-16 md:py-24">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Featured Creators
            </h2>
            <p className="text-lg text-muted-foreground">
              Discover popular creators from our community
            </p>
          </div>
          <CreatorGrid creators={featuredCreators} loading={loadingFeatured} />
          <div className="mt-12 text-center">
            <Button size="lg" variant="outline" asChild>
              <Link to="/explore">
                View All Creators
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      )}

      {/* Categories Preview */}
      {categories && categories.length > 0 && (
        <section className="bg-muted/50 py-16 md:py-24">
          <div className="container">
            <div className="mb-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Browse by Category
              </h2>
              <p className="text-lg text-muted-foreground">
                Find creators in your favorite niches
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/explore?category=${category.slug}`}
                >
                  <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer">
                    <CardContent className="p-6 text-center">
                      {category.icon && (
                        <div className="text-4xl mb-2">{category.icon}</div>
                      )}
                      <h3 className="font-semibold">{category.name}</h3>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="container py-16 md:py-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground">
            Supporting creators is simple and rewarding
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Find Creators</h3>
              <p className="text-muted-foreground">
                Browse through our community of talented creators across
                various categories and find those you want to support.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Subscribe</h3>
              <p className="text-muted-foreground">
                Choose a monthly subscription plan that works for you. Cancel
                anytime, no strings attached.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Get Access</h3>
              <p className="text-muted-foreground">
                Enjoy exclusive content, early access, behind-the-scenes
                updates, and direct interaction with creators.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA for Creators */}
      <section className="bg-gradient-to-br from-primary to-purple-600 text-primary-foreground">
        <div className="container py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Monetize Your Content?
            </h2>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              Join Alpha Marketplace and start earning from your most dedicated
              fans. We provide the tools, you create the content.
            </p>
            <div className="grid sm:grid-cols-3 gap-6 mb-8">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 shrink-0 mt-0.5" />
                <div className="text-left">
                  <h4 className="font-semibold mb-1">Keep 90%</h4>
                  <p className="text-sm opacity-80">
                    Industry-leading revenue share
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 shrink-0 mt-0.5" />
                <div className="text-left">
                  <h4 className="font-semibold mb-1">Easy Setup</h4>
                  <p className="text-sm opacity-80">
                    Start in minutes, not days
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 shrink-0 mt-0.5" />
                <div className="text-left">
                  <h4 className="font-semibold mb-1">Full Control</h4>
                  <p className="text-sm opacity-80">
                    You own your content and audience
                  </p>
                </div>
              </div>
            </div>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/creator/signup">
                Become a Creator
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
