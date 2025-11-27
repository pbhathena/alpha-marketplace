import { useEffect } from 'react'
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  FileText,
  Settings,
  CreditCard,
  LogOut
} from 'lucide-react'

export default function CreatorDashboard() {
  const { user, profile, creatorProfile, isCreator, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Redirect non-creators
  useEffect(() => {
    if (!isCreator && profile) {
      navigate('/become-creator')
    }
  }, [isCreator, profile, navigate])

  if (!user || !isCreator || !creatorProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we load your dashboard</p>
        </div>
      </div>
    )
  }

  const navItems = [
    { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { path: '/dashboard/posts', label: 'Posts', icon: FileText },
    { path: '/dashboard/settings', label: 'Settings', icon: Settings },
    { path: '/dashboard/stripe-setup', label: 'Stripe', icon: CreditCard },
  ]

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">Creator Dashboard</h1>
              {!creatorProfile.stripe_onboarding_complete && (
                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                  Stripe Setup Required
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">@{profile?.username || 'user'}</p>
                <p className="text-xs text-muted-foreground">{profile?.email}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={signOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="col-span-12 md:col-span-3">
            <Card className="p-4">
              {/* Stats Summary */}
              <div className="mb-6 pb-6 border-b">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Subscribers</p>
                    <p className="text-2xl font-bold">{creatorProfile.subscriber_count}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Monthly Price</p>
                    <p className="text-2xl font-bold">
                      ${(creatorProfile.subscription_price_cents / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.path)

                  return (
                    <Link key={item.path} to={item.path}>
                      <Button
                        variant={active ? 'default' : 'ghost'}
                        className="w-full justify-start"
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {item.label}
                      </Button>
                    </Link>
                  )
                })}
              </nav>

              {/* Public Profile Link */}
              <div className="mt-6 pt-6 border-t">
                <Link to={`/@${profile?.username || ''}`}>
                  <Button variant="outline" className="w-full">
                    View Public Profile
                  </Button>
                </Link>
              </div>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="col-span-12 md:col-span-9">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
