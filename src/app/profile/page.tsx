'use client'

import { useEffect, useRef, useState } from 'react'
import { TextHoverEffect } from '@/components/ui/text-hover-effect'
import { supabase } from '@/lib/supabase-client'
import RequireAuth from '@/components/auth/require-auth'
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/scroll-animations'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/ui/icon'
import { appendStoredWallpaper, type DeviceType } from '@/lib/wallpaper-store'

type ProfileData = {
  name: string
  email: string
  username: string
  avatarInitials: string
  subscription: {
    plan: string
    status: string
    billingCycle: string
    renewalDate: string
    nextInvoice: string
  }
  usage: {
    downloadsThisMonth: number
    favorites: number
    devicesConnected: number
    collectionsCount?: number
    totalDownloads?: number
  }
}

type ProfileFormState = {
  name: string
  email: string
  username: string
}

type ProfileActionState = {
  isSavingProfile: boolean
  isResettingPassword: boolean
  isUpdatingSubscription: boolean
  message: string | null
}

export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>('')
  
  const [profile, setProfile] = useState<ProfileFormState>({
    name: '',
    email: '',
    username: ''
  })

  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [statsError, setStatsError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        setIsLoadingStats(true)
        setStatsError(null)
        
        // Get user from Supabase
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          if (!ignore) {
            setStatsError('Not authenticated')
            window.location.href = '/'
          }
          return
        }

        // Try to fetch stats from API
        const res = await fetch('/api/profile/stats')
        if (res.ok) {
          const data = await res.json()
          if (!ignore && data.profile) {
            console.log('Profile data loaded:', data.profile)
            setProfileData(data.profile)
            setProfile({
              name: data.profile.name,
              email: data.profile.email,
              username: data.profile.username
            })
          }
        } else {
          // Fallback to basic user data from Supabase
          console.log('API failed, using fallback data')
          const userMeta = user.user_metadata || {}
          const firstName = userMeta.firstName || ''
          const lastName = userMeta.lastName || ''
          const displayName = `${firstName} ${lastName}`.trim() || user.email?.split('@')[0] || 'User'
          const avatarInitials = firstName && lastName 
            ? `${firstName[0]}${lastName[0]}`.toUpperCase()
            : displayName.slice(0, 2).toUpperCase()
          
          if (!ignore) {
            setProfileData({
              name: displayName,
              email: user.email || '',
              username: userMeta.username || '',
              avatarInitials,
              subscription: {
                plan: 'FREE',
                status: 'Active',
                billingCycle: 'Free',
                renewalDate: 'N/A',
                nextInvoice: '$0.00'
              },
              usage: {
                downloadsThisMonth: 0,
                favorites: 0,
                devicesConnected: 0
              }
            })
            setProfile({
              name: displayName,
              email: user.email || '',
              username: userMeta.username || ''
            })
          }
        }
      } catch (error) {
        console.error('Failed to load profile:', error)
        if (!ignore) setStatsError('Network error loading profile')
      } finally {
        if (!ignore) setIsLoadingStats(false)
      }
    }
    load()
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) window.location.href = '/'
      else load()
    })
    return () => { ignore = true; sub.subscription.unsubscribe() }
  }, [])

  const [actionState, setActionState] = useState<ProfileActionState>({
    isSavingProfile: false,
    isResettingPassword: false,
    isUpdatingSubscription: false,
    message: null
  })

  const [notificationPrefs, setNotificationPrefs] = useState<Record<string, boolean>>({
    'Weekly wallpaper drops': true,
    'Product announcements': true,
    'Account security alerts': true
  })

  const showMessage = (message: string) => {
    setActionState((prev) => ({ ...prev, message }))
    setTimeout(() => {
      setActionState((prev) => ({ ...prev, message: null }))
    }, 2500)
  }

  const handleProfileSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setActionState((prev) => ({ ...prev, isSavingProfile: true }))

    setTimeout(() => {
      if (profileData) {
        setProfileData({
          ...profileData,
          name: profile.name,
          email: profile.email,
          username: profile.username
        })
      }
      setActionState((prev) => ({ ...prev, isSavingProfile: false }))
      showMessage('Profile details updated successfully!')
    }, 1200)
  }

  const handlePasswordReset = () => {
    setActionState((prev) => ({ ...prev, isResettingPassword: true }))

    setTimeout(() => {
      setActionState((prev) => ({ ...prev, isResettingPassword: false }))
      showMessage('Password reset email sent. Wire this up to your auth provider later.')
    }, 1000)
  }

  const handleSubscriptionAction = (action: 'upgrade' | 'cancel' | 'resume') => {
    setActionState((prev) => ({ ...prev, isUpdatingSubscription: true }))

    setTimeout(() => {
      setActionState((prev) => ({ ...prev, isUpdatingSubscription: false }))
      showMessage(`Subscription action "${action}" simulated. Swap with billing API when ready.`)
    }, 1000)
  }

  const toggleNotificationPref = (label: string) => {
    setNotificationPrefs((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  const handleWallpaperUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadProgress('Uploading image...')

    try {
      const formData = new FormData()
      formData.append('file', file)

      setUploadProgress('Analyzing with VoidAI...')
      const analyzeRes = await fetch('/api/wallpapers/analyze', {
        method: 'POST',
        body: formData,
      })

      if (!analyzeRes.ok) {
        const error = await analyzeRes.json()
        throw new Error(error.error || 'Failed to analyze wallpaper')
      }

      const { metadata, image } = await analyzeRes.json()

      setUploadProgress('Creating wallpaper entry...')
      
      // Set featured until 24 hours from now
      const featuredUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      
      // Determine device type based on aspect ratio
      const aspectRatio = image.width / image.height
      const deviceType: DeviceType = aspectRatio > 1 ? 'desktop' : 'mobile'

      const wallpaperEntry = {
        id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        title: metadata.title,
        category: metadata.categorySlug,
        status: 'Published' as const,
        curator: profile.name || 'User',
        deviceType,
        lastEdit: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        previewUrl: image.secureUrl,
        featuredUntil,
      }

      appendStoredWallpaper(wallpaperEntry)

      setUploadProgress('Success! Featured for 24 hours')
      showMessage(`Wallpaper "${metadata.title}" uploaded and featured! AI generated ${metadata.tags.length} tags.`)

      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = ''

      setTimeout(() => setUploadProgress(''), 3000)
    } catch (error: unknown) {
      console.error('Upload failed:', error)
      setUploadProgress('')
      const message = error instanceof Error ? error.message : 'Unexpected error'
      showMessage(`Upload failed: ${message}`)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <RequireAuth>
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <FadeInUp>
          <div className="text-center">
            <div className="h-[150px] md:h-[200px] flex items-center justify-center mb-6">
              <TextHoverEffect text="PROFILE" className="text-6xl md:text-7xl" />
            </div>
            <p className="text-lg md:text-xl text-foreground/70 max-w-3xl mx-auto">
              Manage your Voidwallz identity, tweak subscription settings, and keep your account secure.
            </p>
          </div>
        </FadeInUp>

        {actionState.message && (
          <FadeInUp delay={0.05}>
            <div className="card-brutalist border-primary bg-primary/10 text-primary px-6 py-4 font-mono text-sm uppercase tracking-wide">
              {actionState.message}
            </div>
          </FadeInUp>
        )}

        {/* Overview Card */}
        <FadeInUp delay={0.1}>
          <div className="card-brutalist p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start md:justify-between gap-6">
            {isLoadingStats ? (
              <div className="w-full flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-mono text-foreground/60">Loading profile data...</p>
                </div>
              </div>
            ) : statsError ? (
              <div className="w-full flex items-center justify-center py-12">
                <div className="text-center">
                  <Icon name="exclamation-circle" className="w-12 h-12 mx-auto mb-4 text-red-500" />
                  <p className="text-sm font-mono text-red-500 mb-2">{statsError}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="btn-brutalist px-4 py-2 text-sm"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : profileData ? (
              <>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 md:w-28 md:h-28 border-2 border-foreground bg-card flex items-center justify-center font-mono text-2xl font-bold">
                    {profileData.avatarInitials}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold font-mono uppercase tracking-wide">{profileData.name}</h2>
                    <p className="text-foreground/70">{profileData.email}</p>
                    {profileData.username && (
                      <p className="text-foreground/60 text-sm font-mono">@{profileData.username}</p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-mono">
                      <span className="px-3 py-1 border-2 border-foreground bg-primary text-background">{profileData.subscription.plan === 'FREE' ? 'FREE PLAN' : 'VOID PREMIUM'}</span>
                      <span className="px-3 py-1 border-2 border-foreground">Status: {profileData.subscription.status}</span>
                      <span className="px-3 py-1 border-2 border-foreground">Billing: {profileData.subscription.billingCycle}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full md:w-auto">
                  <div className="p-4 border-2 border-foreground bg-card text-center">
                    <div className="font-mono text-3xl font-bold">{profileData.usage.downloadsThisMonth}</div>
                    <p className="text-xs uppercase tracking-wide text-foreground/70">Downloads this month</p>
                  </div>
                  <div className="p-4 border-2 border-foreground bg-card text-center">
                    <div className="font-mono text-3xl font-bold">{profileData.usage.favorites}</div>
                    <p className="text-xs uppercase tracking-wide text-foreground/70">Favorites saved</p>
                  </div>
                  <div className="p-4 border-2 border-foreground bg-card text-center">
                    <div className="font-mono text-3xl font-bold">{profileData.usage.devicesConnected}</div>
                    <p className="text-xs uppercase tracking-wide text-foreground/70">Devices connected</p>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </FadeInUp>

        {/* AI Upload Section */}
        <FadeInUp delay={0.12}>
          <div className="card-brutalist p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Icon name="sparkles" className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold font-mono uppercase tracking-wide">Upload Wallpaper</h2>
              <span className="px-2 py-1 text-xs font-mono uppercase tracking-wide border border-primary text-primary">VoidAI</span>
            </div>
            <p className="text-sm text-foreground/70 mb-6">
              Upload a new wallpaper and VoidAI will automatically analyze it, generate tags, and feature it on the feed for 24 hours.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <label className={cn(
                "btn-brutalist px-6 py-3 font-mono font-bold uppercase tracking-wide inline-flex items-center gap-2 cursor-pointer",
                isUploading && "opacity-60 cursor-not-allowed"
              )}>
                {isUploading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Icon name="photo" className="w-5 h-5" />
                    <span>Select Image</span>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleWallpaperUpload}
                  disabled={isUploading}
                  className="sr-only"
                />
              </label>
              
              {uploadProgress && (
                <div className="flex items-center gap-2 text-sm font-mono text-primary">
                  <Icon name="calendar-days" className="w-4 h-4" />
                  <span>{uploadProgress}</span>
                </div>
              )}
            </div>
            
            <div className="mt-4 p-3 border-2 border-foreground/20 bg-card/50">
              <div className="flex items-start gap-2 text-xs text-foreground/60">
                <Icon name="info" className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>
                  Supported formats: JPG, PNG, WEBP. Max size: 15MB. AI will auto-generate title, description, category, and tags.
                </p>
              </div>
            </div>
          </div>
        </FadeInUp>

        {/* Profile management sections */}
        <StaggerContainer className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <StaggerItem className="lg:col-span-2">
            <FadeInUp delay={0.15}>
              <form onSubmit={handleProfileSave} className="card-brutalist p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <Icon name="user-circle" className="w-6 h-6" />
                  <h3 className="text-lg font-bold font-mono uppercase tracking-wide">Profile Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <label className="flex flex-col gap-2">
                    <span className="text-xs font-mono uppercase tracking-widest text-foreground/70">Display name</span>
                    <input
                      value={profile.name}
                      onChange={(event) =>
                        setProfile((prev) => ({ ...prev, name: event.target.value }))
                      }
                      className="px-4 py-3 border-2 border-foreground bg-background focus:outline-none focus:bg-primary focus:text-background font-mono"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-xs font-mono uppercase tracking-widest text-foreground/70">Username</span>
                    <input
                      value={profile.username}
                      onChange={(event) =>
                        setProfile((prev) => ({ ...prev, username: event.target.value }))
                      }
                      className="px-4 py-3 border-2 border-foreground bg-background focus:outline-none focus:bg-primary focus:text-background font-mono"
                    />
                  </label>
                </div>

                <label className="flex flex-col gap-2">
                  <span className="text-xs font-mono uppercase tracking-widest text-foreground/70">Email address</span>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(event) =>
                      setProfile((prev) => ({ ...prev, email: event.target.value }))
                    }
                    className="px-4 py-3 border-2 border-foreground bg-background focus:outline-none focus:bg-primary focus:text-background font-mono"
                  />
                </label>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                  <div className="flex items-center gap-2 text-sm text-foreground/70">
                    <Icon name="photo" className="w-5 h-5" />
                    <span>Avatar uploads coming soon. Hook into your storage provider later.</span>
                  </div>
                  <label className="inline-flex items-center gap-2 px-4 py-2 border-2 border-foreground bg-card hover:bg-primary hover:text-background transition-colors duration-200 cursor-pointer">
                    <Icon name="pencil-square" className="w-5 h-5" />
                    <span className="font-mono text-sm uppercase tracking-wide">Upload avatar</span>
                    <input type="file" accept="image/*" className="sr-only" disabled />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={actionState.isSavingProfile}
                  className={cn(
                    'btn-brutalist px-6 py-3 font-mono font-bold uppercase tracking-wide',
                    actionState.isSavingProfile ? 'opacity-60 cursor-not-allowed' : 'hover:bg-secondary hover:text-background'
                  )}
                >
                  {actionState.isSavingProfile ? 'Saving…' : 'Save changes'}
                </button>
              </form>
            </FadeInUp>
          </StaggerItem>

          <StaggerItem>
            <FadeInUp delay={0.2}>
              <div className="card-brutalist p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Icon name="shield" className="w-6 h-6" />
                  <h3 className="text-lg font-bold font-mono uppercase tracking-wide">Security</h3>
                </div>
                <p className="text-sm text-foreground/70">
                  Password reset triggers an email to {profile.email}. Implement with your auth provider when ready.
                </p>
                <button
                  onClick={handlePasswordReset}
                  disabled={actionState.isResettingPassword}
                  className={cn(
                    'w-full btn-brutalist px-4 py-3 font-mono font-bold uppercase tracking-wide flex items-center justify-center gap-2',
                    actionState.isResettingPassword ? 'opacity-60 cursor-not-allowed' : 'hover:bg-primary hover:text-background'
                  )}
                >
                  <Icon name="lock-closed" className="w-5 h-5" />
                  {actionState.isResettingPassword ? 'Sending reset…' : 'Send reset link'}
                </button>
                <button
                  onClick={() => showMessage('Two-factor auth placeholder. Connect to your authentication flow soon.')}
                  className="w-full btn-brutalist px-4 py-3 font-mono font-bold uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-card"
                >
                  <Icon name="key" className="w-5 h-5" />
                  Configure 2FA
                </button>
              </div>
            </FadeInUp>
          </StaggerItem>
        </StaggerContainer>

        {/* Subscription & notifications */}
        <StaggerContainer className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <StaggerItem className="lg:col-span-2">
            <FadeInUp delay={0.25}>
              <div className="card-brutalist p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <Icon name="credit-card" className="w-6 h-6" />
                  <h3 className="text-lg font-bold font-mono uppercase tracking-wide">Subscription</h3>
                </div>

                {profileData && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono uppercase tracking-wide">
                    <div className="p-4 border-2 border-foreground bg-card flex items-center justify-between">
                      <span>Plan</span>
                      <span>{profileData.subscription.plan === 'FREE' ? 'FREE' : profileData.subscription.plan}</span>
                    </div>
                    <div className="p-4 border-2 border-foreground bg-card flex items-center justify-between">
                      <span>Billing cycle</span>
                      <span>{profileData.subscription.billingCycle}</span>
                    </div>
                    <div className="p-4 border-2 border-foreground bg-card flex items-center justify-between">
                      <span>Next renewal</span>
                      <span>{profileData.subscription.renewalDate}</span>
                    </div>
                    <div className="p-4 border-2 border-foreground bg-card flex items-center justify-between">
                      <span>Upcoming invoice</span>
                      <span>{profileData.subscription.nextInvoice}</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => handleSubscriptionAction('upgrade')}
                    disabled={actionState.isUpdatingSubscription}
                    className={cn(
                      'btn-brutalist px-4 py-3 font-mono font-bold uppercase tracking-wide flex items-center justify-center gap-2',
                      actionState.isUpdatingSubscription ? 'opacity-60 cursor-not-allowed' : 'hover:bg-primary hover:text-background'
                    )}
                  >
                    <Icon name="arrow-up-right" className="w-5 h-5" />
                    Upgrade plan
                  </button>
                  <button
                    onClick={() => handleSubscriptionAction('cancel')}
                    disabled={actionState.isUpdatingSubscription}
                    className={cn(
                      'btn-brutalist px-4 py-3 font-mono font-bold uppercase tracking-wide flex items-center justify-center gap-2',
                      actionState.isUpdatingSubscription ? 'opacity-60 cursor-not-allowed' : 'hover:bg-secondary hover:text-background'
                    )}
                  >
                    <Icon name="arrow-path" className="w-5 h-5" />
                    Cancel auto-renew
                  </button>
                  <button
                    onClick={() => handleSubscriptionAction('resume')}
                    disabled={actionState.isUpdatingSubscription}
                    className={cn(
                      'btn-brutalist px-4 py-3 font-mono font-bold uppercase tracking-wide flex items-center justify-center gap-2',
                      actionState.isUpdatingSubscription ? 'opacity-60 cursor-not-allowed' : 'hover:bg-card'
                    )}
                  >
                    <Icon name="star" className="w-5 h-5" />
                    View invoices
                  </button>
                </div>
              </div>
            </FadeInUp>
          </StaggerItem>

          <StaggerItem>
            <FadeInUp delay={0.3}>
              <div className="card-brutalist p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <Icon name="bell" className="w-6 h-6" />
                  <h3 className="text-lg font-bold font-mono uppercase tracking-wide">Notifications</h3>
                </div>

                <div className="space-y-3">
                  {Object.entries(notificationPrefs).map(([label, enabled]) => (
                    <label
                      key={label}
                      className="flex items-center justify-between gap-4 border-2 border-foreground px-4 py-3 bg-card cursor-pointer"
                    >
                      <span className="font-mono text-sm uppercase tracking-wide">{label}</span>
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={() => toggleNotificationPref(label)}
                        className="w-5 h-5 border-2 border-foreground accent-current"
                      />
                    </label>
                  ))}
                </div>

                <p className="text-xs text-foreground/60">
                  These preferences are mocked locally. Swap in API calls when you connect notifications.
                </p>
              </div>
            </FadeInUp>
          </StaggerItem>
        </StaggerContainer>

        {/* Activity & devices */}
        <FadeInUp delay={0.35}>
          <div className="card-brutalist p-6 space-y-6">
            <div className="flex items-center gap-3">
              <Icon name="phone" className="w-6 h-6" />
              <h3 className="text-lg font-bold font-mono uppercase tracking-wide">Devices & activity</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'MacBook Pro', location: 'San Francisco, USA', status: 'Active now', lastActive: 'Just now' },
                { title: 'Pixel 8 Pro', location: 'Bengaluru, India', status: 'Recently active', lastActive: '2 hours ago' },
                { title: 'iPad Air', location: 'Dubai, UAE', status: 'Signed out', lastActive: '3 days ago' }
              ].map((device) => (
                <div key={device.title} className="border-2 border-foreground bg-card p-4 space-y-2 font-mono text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase tracking-wide">{device.title}</span>
                    <Icon name="check-circle" className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-foreground/60 uppercase tracking-wide">{device.location}</p>
                  <p className="text-xs text-foreground/60">Status: {device.status}</p>
                  <p className="text-xs text-foreground/60">Last active: {device.lastActive}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => showMessage('Device refresh simulated. Attach to a sessions endpoint when available.')}
              className="btn-brutalist px-4 py-3 font-mono font-bold uppercase tracking-wide flex items-center gap-2 hover:bg-card"
            >
              <Icon name="calendar-days" className="w-5 h-5" />
              Refresh activity
            </button>
          </div>
        </FadeInUp>
      </div>
    </div>
    </RequireAuth>
  )
}
