import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Settings as SettingsIcon, Bell, Shield, CreditCard, Globe } from 'lucide-react'

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Settings</h2>
        <p className="text-muted-foreground">
          Platform configuration and preferences
        </p>
      </div>

      {/* Platform Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            <CardTitle>Platform Settings</CardTitle>
          </div>
          <CardDescription>Configure general platform behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="platformName">Platform Name</Label>
              <Input id="platformName" defaultValue="Alpha" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="platformUrl">Platform URL</Label>
              <Input id="platformUrl" defaultValue="https://iamanalpha.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input id="supportEmail" defaultValue="support@iamanalpha.com" />
            </div>
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      {/* Payment Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            <CardTitle>Payment Settings</CardTitle>
          </div>
          <CardDescription>Configure payment and payout settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="platformFee">Platform Fee (%)</Label>
              <Input id="platformFee" type="number" defaultValue="20" />
              <p className="text-xs text-muted-foreground">Percentage taken from each subscription</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="minPrice">Minimum Subscription Price ($)</Label>
              <Input id="minPrice" type="number" defaultValue="4.99" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="maxPrice">Maximum Subscription Price ($)</Label>
              <Input id="maxPrice" type="number" defaultValue="99.99" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Test Mode</p>
              <p className="text-sm text-muted-foreground">Use Stripe test keys</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Security</CardTitle>
          </div>
          <CardDescription>Platform security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Require Email Verification</p>
              <p className="text-sm text-muted-foreground">Users must verify email before accessing features</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Allow Public Profiles</p>
              <p className="text-sm text-muted-foreground">Allow creator profiles to be publicly visible</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Content Moderation</p>
              <p className="text-sm text-muted-foreground">Automatically flag potentially inappropriate content</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <CardDescription>Admin notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">New Creator Signup</p>
              <p className="text-sm text-muted-foreground">Get notified when a new creator joins</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Flagged Content</p>
              <p className="text-sm text-muted-foreground">Get notified when content is flagged</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Payment Issues</p>
              <p className="text-sm text-muted-foreground">Get notified about payment failures</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
