import { useEffect } from 'react'
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  LayoutDashboard,
  CreditCard,
  MessageCircle,
  Settings,
  LogOut,
  Heart
} from 'lucide-react'

export default function PatronDashboard() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!user && !profile) {
      navigate('/login')
    }
  }, [user, profile, navigate])

  if (!user || !profile) {
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
    { path: '/my-account', label: 'Overview', icon: LayoutDashboard },
    { path: '/my-account/subscriptions', label: 'My Subscriptions', icon: Heart },
    { path: '/my-account/messages', label: 'Messages', icon: MessageCircle },
    { path: '/my-account/billing', label: 'Billing', icon: CreditCard },
    { path: '/my-account/settings', label: 'Settings', icon: Settings },
  ]

  const isActive = (path: string) => {
    if (path === '/my-account') {
      return location.pathname === '/my-account'
    }
    return location.pathname.startsWith(path)
  }

  const getInitials = (name: string | null) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <Link to="/" className="text-xl md:text-2xl font-bold text-primary">Alpha</Link>
              <span className="text-muted-foreground hidden md:inline">/</span>
              <h1 className="text-lg md:text-xl font-semibold">My Account</h1>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium">{profile.full_name || profile.username}</p>
                <p className="text-xs text-muted-foreground">{profile.email}</p>
              </div>
              <Avatar className="h-8 w-8 md:h-10 md:w-10">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback>{getInitials(profile.full_name)}</AvatarFallback>
              </Avatar>
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
              {/* User Profile Summary */}
              <div className="mb-6 pb-6 border-b text-center">
                <Avatar className="h-20 w-20 mx-auto mb-3">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="text-2xl">{getInitials(profile.full_name)}</AvatarFallback>
                </Avatar>
                <h3 className="font-semibold">{profile.full_name || profile.username}</h3>
                <p className="text-sm text-muted-foreground">@{profile.username}</p>
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

              {/* Become a Creator CTA */}
              {profile.role !== 'creator' && (
                <div className="mt-6 pt-6 border-t">
                  <Link to="/become-creator">
                    <Button variant="outline" className="w-full">
                      Become a Creator
                    </Button>
                  </Link>
                </div>
              )}
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
