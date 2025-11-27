import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Play, Users, TrendingUp, Shield, Star } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import type { Category } from '@/types/database'

// Professional category images
const categoryImages: Record<string, string> = {
  fitness: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop',
  bodybuilding: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&h=400&fit=crop',
  nutrition: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop',
  business: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
  lifestyle: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&h=400&fit=crop',
  education: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&h=400&fit=crop',
  sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&h=400&fit=crop',
  creative: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=400&fit=crop',
  mindset: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=400&fit=crop',
  combat: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600&h=400&fit=crop',
  endurance: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&h=400&fit=crop',
  recovery: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop',
}

export default function Index() {
  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order')
        .limit(8)

      if (error) {
        console.error('Error fetching categories:', error)
        return []
      }
      return data as Category[]
    },
  })

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 hero-pattern" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />

        {/* Content */}
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left column - Text */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-medium text-primary">The Platform for Leaders & Influencers</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="text-white">We Empower</span>
                <br />
                <span className="text-alpha-gradient">Alphas</span>
              </h1>

              <p className="text-xl text-muted-foreground max-w-lg">
                <strong className="text-white">An Alpha:</strong> One who coaches, educates, leads, and influences.
                Join the platform where influencers get rewarded for the value they provide.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-primary hover:bg-primary-light text-white px-8 py-6 text-lg" asChild>
                  <Link to="/explore">
                    Explore Alphas
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg" asChild>
                  <Link to="/become-creator">
                    <Play className="mr-2 h-5 w-5" />
                    Become an Alpha
                  </Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="flex gap-8 pt-8 border-t border-white/10">
                <div>
                  <div className="text-3xl font-bold text-white">10K+</div>
                  <div className="text-sm text-muted-foreground">Active Members</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">500+</div>
                  <div className="text-sm text-muted-foreground">Expert Alphas</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">50K+</div>
                  <div className="text-sm text-muted-foreground">Content Pieces</div>
                </div>
              </div>
            </div>

            {/* Right column - Featured visual */}
            <div className="relative hidden lg:block">
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                {/* Decorative elements */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 to-transparent rotate-6" />
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-primary/10 to-transparent -rotate-6" />

                {/* Main card */}
                <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-card p-8">
                  <div className="aspect-square rounded-2xl overflow-hidden mb-6">
                    <img
                      src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=600&fit=crop"
                      alt="Featured Alpha"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Star className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">Featured Alpha</div>
                        <div className="text-sm text-muted-foreground">Fitness & Training</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating badges */}
                <div className="absolute -left-4 top-1/4 glass rounded-xl px-4 py-3 animate-float">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">Trending</span>
                  </div>
                </div>
                <div className="absolute -right-4 bottom-1/4 glass rounded-xl px-4 py-3 animate-float" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">1.2K Members</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-card/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Browse Categories</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find your Alpha in the category that matches your goals
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoriesLoading ? (
              // Loading skeletons
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden bg-card animate-pulse">
                  <div className="aspect-[4/3] bg-white/10" />
                  <div className="p-4">
                    <div className="h-5 bg-white/10 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-white/10 rounded w-full" />
                  </div>
                </div>
              ))
            ) : categories && categories.length > 0 ? (
              categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/explore?category=${category.slug}`}
                  className="group relative rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow"
                >
                  {/* Category Image */}
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <img
                      src={categoryImages[category.slug] || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop'}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Category name overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-bold text-xl text-white group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {category.description}
                    </p>
                  </div>

                  {/* Hover accent line */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary-light opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No categories found
              </div>
            )}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-white" asChild>
              <Link to="/explore">
                View All Categories
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Choose Alpha</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The platform built for coaches, educators, and influencers to thrive
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all">
              <div className="feature-icon mb-6">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Build Your Community</h3>
              <p className="text-muted-foreground">
                Create a dedicated space for your audience. Share exclusive content, resources, and connect directly with your members.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all">
              <div className="feature-icon mb-6">
                <TrendingUp className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Monetize Your Expertise</h3>
              <p className="text-muted-foreground">
                Set your own subscription price and keep 80% of your earnings. Get paid monthly for the value you provide.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all">
              <div className="feature-icon mb-6">
                <Shield className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Full Control</h3>
              <p className="text-muted-foreground">
                You own your content and your audience. No algorithms, no restrictions - just direct connection with your members.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-alpha-gradient opacity-90" />
        <div className="absolute inset-0 hero-pattern opacity-50" />

        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Become an Alpha?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Join the platform that empowers coaches, educators, and influencers to monetize their expertise and build their audience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 px-8 py-6 text-lg" asChild>
                <Link to="/become-creator">
                  Get Started Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg" asChild>
                <Link to="/explore">
                  Explore Alphas
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
