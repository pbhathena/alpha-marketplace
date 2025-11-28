import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, LogOut, Settings, LayoutDashboard, User, Shield, Heart } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { NotificationDropdown } from './NotificationDropdown'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, profile, isLoading, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img
            src="/alpha-logo-white.png"
            alt="Alpha"
            className="h-8 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="ml-auto flex items-center space-x-4">
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              to="/explore"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Explore
            </Link>
          </nav>

          {/* Auth Section */}
          <div className="flex items-center space-x-2">
            {isLoading ? (
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            ) : user && profile ? (
              <>
                {/* Notifications */}
                <NotificationDropdown />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.full_name ?? 'User'} />
                        <AvatarFallback>{getInitials(profile.full_name ?? 'User')}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium text-sm">{profile.full_name}</p>
                        <p className="w-[200px] truncate text-xs text-muted-foreground">
                          {profile.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    {/* Role-specific dashboard links */}
                    {profile.role === 'admin' && (
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Portal
                      </DropdownMenuItem>
                    )}
                    {profile.role === 'creator' && (
                      <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Creator Dashboard
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => navigate('/my-account')}>
                      <Heart className="mr-2 h-4 w-4" />
                      My Subscriptions
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(
                      profile.role === 'creator' ? '/dashboard/settings' :
                      profile.role === 'admin' ? '/admin/settings' :
                      '/my-account/settings'
                    )}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  Log in
                </Button>
                <Button onClick={() => navigate('/signup')}>Sign up</Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="border-t md:hidden">
          <div className="container space-y-1 px-4 py-4">
            <Link
              to="/explore"
              className="block rounded-md px-3 py-2 text-base font-medium hover:bg-accent"
              onClick={() => setIsMenuOpen(false)}
            >
              Explore
            </Link>
            {!user && (
              <>
                <Link
                  to="/login"
                  className="block rounded-md px-3 py-2 text-base font-medium hover:bg-accent"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="block rounded-md px-3 py-2 text-base font-medium hover:bg-accent"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
