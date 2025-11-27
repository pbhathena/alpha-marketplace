import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import {
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  Edit,
  PlusCircle,
  AlertCircle
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function Overview() {
  const { profile, creatorProfile } = useAuth()

  if (!profile || !creatorProfile) {
    return null
  }

  const stats = [
    {
      title: 'Total Subscribers',
      value: creatorProfile.subscriber_count,
      icon: Users,
      description: 'Active subscribers',
      trend: null,
    },
    {
      title: 'Monthly Revenue',
      value: `$${((creatorProfile.subscriber_count * creatorProfile.subscription_price_cents) / 100).toFixed(2)}`,
      icon: DollarSign,
      description: 'Estimated monthly',
      trend: null,
    },
    {
      title: 'Subscription Price',
      value: `$${(creatorProfile.subscription_price_cents / 100).toFixed(2)}`,
      icon: TrendingUp,
      description: 'Per month',
      trend: null,
    },
    {
      title: 'Posts',
      value: '0',
      icon: FileText,
      description: 'Total posts',
      trend: null,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold mb-2">
          Welcome back, {profile.full_name || profile.username}!
        </h2>
        <p className="text-muted-foreground">
          Here's an overview of your creator dashboard
        </p>
      </div>

      {/* Stripe Onboarding Alert */}
      {!creatorProfile.stripe_onboarding_complete && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Action Required: Connect Stripe</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-3">
              You need to connect your Stripe account to receive payments from subscribers.
            </p>
            <Link to="/dashboard/stripe-setup">
              <Button variant="outline" size="sm">
                Complete Stripe Setup
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Get started with these common tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/dashboard/posts/new">
            <Button variant="outline" className="w-full h-auto py-4" size="lg">
              <div className="flex items-center gap-3">
                <PlusCircle className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">Create New Post</div>
                  <div className="text-sm text-muted-foreground">
                    Share content with your subscribers
                  </div>
                </div>
              </div>
            </Button>
          </Link>

          <Link to="/dashboard/settings">
            <Button variant="outline" className="w-full h-auto py-4" size="lg">
              <div className="flex items-center gap-3">
                <Edit className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">Edit Profile</div>
                  <div className="text-sm text-muted-foreground">
                    Update your creator information
                  </div>
                </div>
              </div>
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Your current creator profile details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Username</p>
              <p className="text-base">@{profile.username}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-base">{profile.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tagline</p>
              <p className="text-base">{creatorProfile.tagline || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <p className="text-base">
                {creatorProfile.is_active ? (
                  <span className="text-green-600">Active</span>
                ) : (
                  <span className="text-red-600">Inactive</span>
                )}
              </p>
            </div>
          </div>
          {creatorProfile.bio && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Bio</p>
              <p className="text-base text-muted-foreground">{creatorProfile.bio}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Getting Started Guide */}
      {creatorProfile.subscriber_count === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Tips to grow your creator profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Complete your Stripe setup to start accepting payments</li>
              <li>Create your first post to engage potential subscribers</li>
              <li>Share your profile link on social media</li>
              <li>Engage with your audience regularly</li>
              <li>Offer exclusive content to attract subscribers</li>
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
