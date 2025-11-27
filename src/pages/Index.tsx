import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Play, Users, TrendingUp, Shield, Star, ChevronRight } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import type { Category } from '@/types/database'

export default function Index() {
  // Fetch categories
  const { data: categories } = useQuery({
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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 hero-pattern" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />

        {/* Content */}
        <div className="container relative z-10 py-20">
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

              <p className="text-xl text-foreground-muted max-w-lg">
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
                  <div className="text-sm text-foreground-muted">Active Members</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">500+</div>
                  <div className="text-sm text-foreground-muted">Expert Alphas</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">50K+</div>
                  <div className="text-sm text-foreground-muted">Content Pieces</div>
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
                <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-background-card p-8">
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
                        <div className="text-sm text-foreground-muted">Fitness & Training</div>
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
      <section className="py-24 bg-background-light">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">Browse Categories</h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              Find your Alpha in the category that matches your goals
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories && categories.length > 0 ? (
              categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/explore?category=${category.slug}`}
                  className="group category-card"
                >
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <h3 className="font-semibold text-white mb-1 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-foreground-muted line-clamp-2">
                    {category.description}
                  </p>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all" />
                </Link>
              ))
            ) : (
              // Placeholder cards while loading
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="category-card animate-pulse">
                  <div className="w-12 h-12 rounded-xl bg-white/10 mb-4" />
                  <div className="h-5 bg-white/10 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-white/10 rounded w-full" />
                </div>
              ))
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
      <section className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">Why Choose Alpha</h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              The platform built for coaches, educators, and influencers to thrive
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group p-8 rounded-2xl bg-background-card border border-border hover:border-primary/50 transition-all">
              <div className="feature-icon mb-6">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Build Your Community</h3>
              <p className="text-foreground-muted">
                Create a dedicated space for your audience. Share exclusive content, resources, and connect directly with your members.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-background-card border border-border hover:border-primary/50 transition-all">
              <div className="feature-icon mb-6">
                <TrendingUp className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Monetize Your Expertise</h3>
              <p className="text-foreground-muted">
                Set your own subscription price and keep 80% of your earnings. Get paid monthly for the value you provide.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-background-card border border-border hover:border-primary/50 transition-all">
              <div className="feature-icon mb-6">
                <Shield className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Full Control</h3>
              <p className="text-foreground-muted">
                You own your content and your audience. No algorithms, no restrictions - just direct connection with your members.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
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

      {/* Footer */}
      <footer className="py-16 bg-background border-t border-border">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <img src="/alpha-logo-white.png" alt="Alpha" className="h-8 mb-4" />
              <p className="text-foreground-muted text-sm">
                We Empower Alphas. The platform for coaches, educators, leaders, and influencers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-foreground-muted">
                <li><Link to="/explore" className="hover:text-white transition-colors">Explore</Link></li>
                <li><Link to="/become-creator" className="hover:text-white transition-colors">Become an Alpha</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-foreground-muted">
                <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-foreground-muted">
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-foreground-muted">
              © {new Date().getFullYear()} Alpha. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-foreground-muted hover:text-primary transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="text-foreground-muted hover:text-primary transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="#" className="text-foreground-muted hover:text-primary transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
