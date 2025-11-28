import { useEffect } from 'react'
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  LayoutDashboard,
  Users,
  UserCheck,
  DollarSign,
  FileText,
  Settings,
  LogOut,
  Shield
} from 'lucide-react'

export default function AdminPortal() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Redirect non-admins
  useEffect(() => {
    if (profile && profile.role !== 'admin') {
      navigate('/')
    }
  }, [profile, navigate])

  if (!user || !profile || profile.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">You must be an admin to access this page</p>
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/creators', label: 'Creators', icon: UserCheck },
    { path: '/admin/revenue', label: 'Revenue', icon: DollarSign },
    { path: '/admin/content', label: 'Content', icon: FileText },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
  ]

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin'
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
              <div className="flex items-center gap-1 md:gap-2">
                <Shield className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <h1 className="text-lg md:text-xl font-semibold">Admin</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium">{profile.full_name || profile.username}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
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
          <aside className="col-span-12 md:col-span-3 lg:col-span-2">
            <Card className="p-4 sticky top-4">
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
                        size="sm"
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {item.label}
                      </Button>
                    </Link>
                  )
                })}
              </nav>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="col-span-12 md:col-span-9 lg:col-span-10">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
