import { useState, useEffect, FormEvent, ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, Check, User, FileText, DollarSign, Image, CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import type { Category } from '@/types/database'

const steps = [
  { id: 1, name: 'Identity', icon: User, description: 'Username & profile' },
  { id: 2, name: 'Content', icon: FileText, description: 'Bio & category' },
  { id: 3, name: 'Pricing', icon: DollarSign, description: 'Subscription price' },
  { id: 4, name: 'Branding', icon: Image, description: 'Avatar & banner' },
  { id: 5, name: 'Payments', icon: CreditCard, description: 'Connect Stripe' },
]

interface FormData {
  username: string
  tagline: string
  bio: string
  categoryId: string
  subscriptionPrice: string
}

export default function BecomeCreator() {
  const { user, profile, isCreator, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState<FormData>({
    username: '',
    tagline: '',
    bio: '',
    categoryId: '',
    subscriptionPrice: '9.99',
  })

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  const [bannerPreview, setBannerPreview] = useState<string>('')

  const [categories, setCategories] = useState<Category[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [usernameError, setUsernameError] = useState<string>('')
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)

  // Redirect if already a creator
  useEffect(() => {
    if (isCreator) {
      navigate('/dashboard')
    }
  }, [isCreator, navigate])

  // Load categories
  useEffect(() => {
    loadCategories()
  }, [])

  // Set initial username from profile
  useEffect(() => {
    if (profile?.username) {
      setFormData(prev => ({ ...prev, username: profile.username || '' }))
    }
  }, [profile])

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true })

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error loading categories:', error)
      toast.error('Failed to load categories')
    } finally {
      setIsLoadingCategories(false)
    }
  }

  const validateUsername = (username: string): string => {
    if (username.length < 3 || username.length > 20) {
      return 'Username must be between 3 and 20 characters'
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return 'Username can only contain letters, numbers, and underscores'
    }
    return ''
  }

  const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    if (!username || username === profile?.username) return true

    setIsCheckingUsername(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      if (data) {
        setUsernameError('Username already taken')
        return false
      }

      setUsernameError('')
      return true
    } catch (error) {
      console.error('Error checking username:', error)
      return false
    } finally {
      setIsCheckingUsername(false)
    }
  }

  const handleUsernameBlur = async () => {
    const error = validateUsername(formData.username)
    if (error) {
      setUsernameError(error)
      return
    }
    await checkUsernameAvailability(formData.username)
  }

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleBannerChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setBannerFile(file)
      setBannerPreview(URL.createObjectURL(file))
    }
  }

  const uploadImage = async (file: File, bucket: string, folder: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user!.id}-${Date.now()}.${fileExt}`
      const filePath = `${folder}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!user) return

    // Validate username
    const usernameValidationError = validateUsername(formData.username)
    if (usernameValidationError) {
      setUsernameError(usernameValidationError)
      return
    }

    const isUsernameAvailable = await checkUsernameAvailability(formData.username)
    if (!isUsernameAvailable) return

    setIsSubmitting(true)

    try {
      // Upload images
      let avatarUrl = profile?.avatar_url
      let bannerUrl: string | null = null

      if (avatarFile) {
        avatarUrl = await uploadImage(avatarFile, 'avatars', 'creator-avatars')
      }

      if (bannerFile) {
        bannerUrl = await uploadImage(bannerFile, 'banners', 'creator-banners')
      }

      // Update profile with username and avatar
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          avatar_url: avatarUrl,
          role: 'creator',
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      // Create creator profile
      const subscriptionPriceCents = Math.round(parseFloat(formData.subscriptionPrice) * 100)

      const { error: creatorProfileError } = await supabase
        .from('creator_profiles')
        .insert({
          user_id: user.id,
          tagline: formData.tagline || null,
          bio: formData.bio || null,
          category_id: formData.categoryId || null,
          banner_url: bannerUrl,
          subscription_price_cents: subscriptionPriceCents,
        })

      if (creatorProfileError) throw creatorProfileError

      // Refresh profile data
      await refreshProfile()

      toast.success('Creator profile created successfully!')

      // Redirect to Stripe setup
      navigate('/dashboard/stripe-setup')
    } catch (error: any) {
      console.error('Error creating creator profile:', error)
      toast.error(error.message || 'Failed to create creator profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Please log in to become a creator</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate current step based on filled data
  const getCurrentStep = () => {
    if (!formData.username) return 1
    if (!formData.bio && !formData.categoryId) return 2
    if (!formData.subscriptionPrice) return 3
    return 4 // Ready to complete
  }

  const currentStep = getCurrentStep()

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8 md:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Become a Creator</h1>
          <p className="text-muted-foreground">
            Start earning from your content and build your community
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8 hidden md:block">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => {
              const Icon = step.icon
              const isCompleted = step.id < currentStep
              const isCurrent = step.id === currentStep
              const isLast = idx === steps.length - 1

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                        isCompleted
                          ? 'bg-primary border-primary text-primary-foreground'
                          : isCurrent
                          ? 'border-primary text-primary'
                          : 'border-muted-foreground/30 text-muted-foreground/50'
                      }`}
                    >
                      {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </div>
                    <span className={`text-xs mt-2 font-medium ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>
                      {step.name}
                    </span>
                  </div>
                  {!isLast && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        isCompleted ? 'bg-primary' : 'bg-muted-foreground/20'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Mobile Step Indicator */}
        <div className="mb-6 md:hidden">
          <div className="flex items-center justify-center gap-2">
            {steps.slice(0, 4).map((step) => (
              <div
                key={step.id}
                className={`w-2 h-2 rounded-full ${
                  step.id < currentStep
                    ? 'bg-primary'
                    : step.id === currentStep
                    ? 'bg-primary/50'
                    : 'bg-muted-foreground/20'
                }`}
              />
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-2">
            Step {Math.min(currentStep, 4)} of 4: {steps[Math.min(currentStep - 1, 3)].description}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Creator Profile Setup</CardTitle>
            <CardDescription>
              Fill in your details to create your creator profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">
                  Username <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  onBlur={handleUsernameBlur}
                  placeholder="your_username"
                  required
                  disabled={isSubmitting}
                />
                {isCheckingUsername && (
                  <p className="text-sm text-muted-foreground">Checking availability...</p>
                )}
                {usernameError && (
                  <p className="text-sm text-destructive">{usernameError}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  3-20 characters, alphanumeric and underscores only
                </p>
              </div>

              {/* Tagline */}
              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={formData.tagline}
                  onChange={(e) => handleInputChange('tagline', e.target.value)}
                  placeholder="A short description of what you create"
                  maxLength={100}
                  disabled={isSubmitting}
                />
                <p className="text-sm text-muted-foreground">
                  A catchy one-liner about your content
                </p>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell your audience about yourself and your content..."
                  rows={4}
                  maxLength={500}
                  disabled={isSubmitting}
                />
                <p className="text-sm text-muted-foreground">
                  {formData.bio.length}/500 characters
                </p>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => handleInputChange('categoryId', value)}
                  disabled={isLoadingCategories || isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subscription Price */}
              <div className="space-y-2">
                <Label htmlFor="price">
                  Monthly Subscription Price (USD) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0.99"
                  max="999.99"
                  value={formData.subscriptionPrice}
                  onChange={(e) => handleInputChange('subscriptionPrice', e.target.value)}
                  placeholder="9.99"
                  required
                  disabled={isSubmitting}
                />
                <p className="text-sm text-muted-foreground">
                  Minimum $0.99, maximum $999.99
                </p>
              </div>

              {/* Avatar Upload */}
              <div className="space-y-2">
                <Label htmlFor="avatar">Profile Picture</Label>
                <div className="flex items-center gap-4">
                  {avatarPreview && (
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <Input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      disabled={isSubmitting}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Recommended: Square image, at least 400x400px
                    </p>
                  </div>
                </div>
              </div>

              {/* Banner Upload */}
              <div className="space-y-2">
                <Label htmlFor="banner">Banner Image</Label>
                <div className="space-y-2">
                  {bannerPreview && (
                    <img
                      src={bannerPreview}
                      alt="Banner preview"
                      className="w-full h-32 rounded-lg object-cover"
                    />
                  )}
                  <Input
                    id="banner"
                    type="file"
                    accept="image/*"
                    onChange={handleBannerChange}
                    disabled={isSubmitting}
                  />
                  <p className="text-sm text-muted-foreground">
                    Recommended: 1500x500px or similar aspect ratio
                  </p>
                </div>
              </div>

              {/* Info Alert */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  After creating your profile, you'll need to connect your Stripe account to receive payments.
                </AlertDescription>
              </Alert>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || isCheckingUsername || !!usernameError}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  'Create Creator Profile'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
