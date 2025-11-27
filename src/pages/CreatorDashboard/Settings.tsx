import { useState, useEffect, FormEvent, ChangeEvent } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import type { Category } from '@/types/database'

interface FormData {
  tagline: string
  bio: string
  categoryId: string
  subscriptionPrice: string
  twitter: string
  instagram: string
  youtube: string
  website: string
}

export default function Settings() {
  const { user, profile, creatorProfile, refreshProfile } = useAuth()

  const [formData, setFormData] = useState<FormData>({
    tagline: '',
    bio: '',
    categoryId: '',
    subscriptionPrice: '9.99',
    twitter: '',
    instagram: '',
    youtube: '',
    website: '',
  })

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  const [bannerPreview, setBannerPreview] = useState<string>('')

  const [categories, setCategories] = useState<Category[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load initial data
  useEffect(() => {
    loadCategories()
    if (creatorProfile) {
      const socialLinks = (creatorProfile.social_links as any) || {}
      setFormData({
        tagline: creatorProfile.tagline || '',
        bio: creatorProfile.bio || '',
        categoryId: creatorProfile.category_id || '',
        subscriptionPrice: (creatorProfile.subscription_price_cents / 100).toFixed(2),
        twitter: socialLinks.twitter || '',
        instagram: socialLinks.instagram || '',
        youtube: socialLinks.youtube || '',
        website: socialLinks.website || '',
      })
    }
    if (profile?.avatar_url) {
      setAvatarPreview(profile.avatar_url)
    }
    if (creatorProfile?.banner_url) {
      setBannerPreview(creatorProfile.banner_url)
    }
  }, [creatorProfile, profile])

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

    if (!user || !creatorProfile) return

    setIsSubmitting(true)

    try {
      // Upload new images if selected
      let avatarUrl = profile?.avatar_url
      let bannerUrl = creatorProfile?.banner_url

      if (avatarFile) {
        avatarUrl = await uploadImage(avatarFile, 'avatars', 'creator-avatars')
      }

      if (bannerFile) {
        bannerUrl = await uploadImage(bannerFile, 'banners', 'creator-banners')
      }

      // Update profile avatar
      if (avatarFile && avatarUrl) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ avatar_url: avatarUrl })
          .eq('id', user.id)

        if (profileError) throw profileError
      }

      // Update creator profile
      const subscriptionPriceCents = Math.round(parseFloat(formData.subscriptionPrice) * 100)

      const socialLinks = {
        twitter: formData.twitter || null,
        instagram: formData.instagram || null,
        youtube: formData.youtube || null,
        website: formData.website || null,
      }

      const { error: creatorError } = await supabase
        .from('creator_profiles')
        .update({
          tagline: formData.tagline || null,
          bio: formData.bio || null,
          category_id: formData.categoryId || null,
          banner_url: bannerUrl,
          subscription_price_cents: subscriptionPriceCents,
          social_links: socialLinks,
        })
        .eq('user_id', user.id)

      if (creatorError) throw creatorError

      // Refresh profile data
      await refreshProfile()

      toast.success('Profile updated successfully!')

      // Clear file inputs
      setAvatarFile(null)
      setBannerFile(null)
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!creatorProfile) {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Profile Settings</h2>
        <p className="text-muted-foreground">
          Manage your creator profile information
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Update your public profile details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Pricing</CardTitle>
            <CardDescription>
              Set your monthly subscription price
            </CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Images</CardTitle>
            <CardDescription>
              Update your profile picture and banner
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle>Social Links</CardTitle>
            <CardDescription>
              Add links to your social media profiles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter</Label>
              <Input
                id="twitter"
                value={formData.twitter}
                onChange={(e) => handleInputChange('twitter', e.target.value)}
                placeholder="https://twitter.com/yourusername"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={formData.instagram}
                onChange={(e) => handleInputChange('instagram', e.target.value)}
                placeholder="https://instagram.com/yourusername"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtube">YouTube</Label>
              <Input
                id="youtube"
                value={formData.youtube}
                onChange={(e) => handleInputChange('youtube', e.target.value)}
                placeholder="https://youtube.com/@yourusername"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://yourwebsite.com"
                disabled={isSubmitting}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
