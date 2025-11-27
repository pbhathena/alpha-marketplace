import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, CheckCircle2, DollarSign, Users, Zap, Award, BookOpen, Heart } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CreatorGrid } from '@/components/creator/CreatorGrid'
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
    <div className="min-h-screen bg-background">
      {/* Hero Section - Alpha Branded */}
      <section className="relative overflow-hidden bg-alpha-gradient">
        <div className="absolute inset-0 bg-[url('/alpha-pattern.svg')] opacity-5" />
        <div className="container relative py-20 md:py-32 lg:py-40">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Award className="h-5 w-5 text-white" />
              <span className="text-white/90 text-sm font-medium">The Platform for Coaches, Educators & Leaders</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-white">
              We Empower Alphas
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-4 max-w-2xl mx-auto">
              <strong className="text-white">An Alpha:</strong> One who coaches, educates, leads, and influences.
            </p>
            <p className="text-lg md:text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              Join the platform that helps influencers get rewarded for the value they provide their audience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90" asChild>
                <Link to="/explore">
                  Explore Alphas
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                <Link to="/become-creator">Become an Alpha</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What is Alpha Section */}
      <section className="bg-background-light py-16 md:py-24">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mb-4">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Educators</h3>
                <p className="text-gray-400">
                  Share your knowledge and expertise with a dedicated audience
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mb-4">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Coaches</h3>
                <p className="text-gray-400">
                  Transform lives with personalized guidance and exclusive content
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Leaders</h3>
                <p className="text-gray-400">
                  Build and engage your community with premium content
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Creators */}
      {featuredCreators && featuredCreators.length > 0 && (
        <section className="container py-16 md:py-24">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Featured Alphas
            </h2>
            <p className="text-lg text-gray-400">
              Discover top coaches, educators, and influencers from our community
            </p>
          </div>
          <CreatorGrid creators={featuredCreators} loading={loadingFeatured} />
          <div className="mt-12 text-center">
            <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white" asChild>
              <Link to="/explore">
                View All Alphas
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      )}

      {/* Categories Preview */}
      {categories && categories.length > 0 && (
        <section className="bg-background-light py-16 md:py-24">
          <div className="container">
            <div className="mb-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                Browse by Category
              </h2>
              <p className="text-lg text-gray-400">
                Find Alphas in your favorite niches
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/explore?category=${category.slug}`}
                >
                  <Card className="bg-surface border-border hover:border-primary transition-all hover:scale-105 cursor-pointer">
                    <CardContent className="p-6 text-center">
                      {category.icon && (
                        <div className="text-4xl mb-2">{category.icon}</div>
                      )}
                      <h3 className="font-semibold text-white">{category.name}</h3>
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">How It Works</h2>
          <p className="text-lg text-gray-400">
            Supporting Alphas is simple and rewarding
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="bg-surface border-border">
            <CardContent className="pt-6">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">1. Find Your Alpha</h3>
              <p className="text-gray-400">
                Browse through our community of coaches, educators, and leaders
                across various categories.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-surface border-border">
            <CardContent className="pt-6">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">2. Subscribe</h3>
              <p className="text-gray-400">
                Choose a monthly subscription plan that works for you. Cancel
                anytime, no strings attached.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-surface border-border">
            <CardContent className="pt-6">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">3. Get Exclusive Access</h3>
              <p className="text-gray-400">
                Enjoy exclusive content, resources, Q&A sessions, and direct
                interaction with your Alpha.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA for Creators */}
      <section className="bg-alpha-gradient">
        <div className="container py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
              Ready to Become an Alpha?
            </h2>
            <p className="text-lg md:text-xl mb-8 text-white/80">
              Join the platform that empowers coaches, educators, and influencers
              to monetize their expertise and build their audience.
            </p>
            <div className="grid sm:grid-cols-3 gap-6 mb-8">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 shrink-0 mt-0.5 text-white" />
                <div className="text-left">
                  <h4 className="font-semibold mb-1 text-white">Keep 80%</h4>
                  <p className="text-sm text-white/70">
                    Competitive revenue share
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 shrink-0 mt-0.5 text-white" />
                <div className="text-left">
                  <h4 className="font-semibold mb-1 text-white">Easy Setup</h4>
                  <p className="text-sm text-white/70">
                    Start in minutes, not days
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 shrink-0 mt-0.5 text-white" />
                <div className="text-left">
                  <h4 className="font-semibold mb-1 text-white">Full Control</h4>
                  <p className="text-sm text-white/70">
                    You own your content and audience
                  </p>
                </div>
              </div>
            </div>
            <Button size="lg" className="bg-white text-primary hover:bg-white/90" asChild>
              <Link to="/become-creator">
                Become an Alpha
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img src="/alpha-logo-white.png" alt="Alpha" className="h-8" />
              <span className="text-gray-400">We Empower Alphas</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link to="/support" className="hover:text-white transition-colors">Support</Link>
            </div>
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Alpha. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
