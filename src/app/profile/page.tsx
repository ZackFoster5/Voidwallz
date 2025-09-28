'use client'

import { useState } from 'react'
import { TextHoverEffect } from '@/components/ui/text-hover-effect'
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/scroll-animations'
import { cn } from '@/lib/utils'
import {
  UserCircleIcon,
  PhotoIcon,
  PencilSquareIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  KeyIcon,
  ArrowUpRightIcon,
  ArrowPathIcon,
  StarIcon,
  CreditCardIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  BellIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline'

const mockProfile = {
  name: 'Nikhil Sharma',
  email: 'nikhil@voidwallz.com',
  username: 'voidnik',
  avatarInitials: 'NS',
  subscription: {
    plan: 'VOID PREMIUM',
    status: 'Active',
    billingCycle: 'Yearly',
    renewalDate: 'December 1, 2025',
    nextInvoice: '$39.99'
  },
  usage: {
    downloadsThisMonth: 42,
    favorites: 128,
    devicesConnected: 3
  },
  notifications: [
    'Weekly wallpaper drops',
    'Product announcements',
    'Account security alerts'
  ]
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
  const [profile, setProfile] = useState<ProfileFormState>({
    name: mockProfile.name,
    email: mockProfile.email,
    username: mockProfile.username
  })

  const [actionState, setActionState] = useState<ProfileActionState>({
    isSavingProfile: false,
    isResettingPassword: false,
    isUpdatingSubscription: false,
    message: null
  })

  const [notificationPrefs, setNotificationPrefs] = useState(
    mockProfile.notifications.reduce<Record<string, boolean>>((acc, label) => {
      acc[label] = true
      return acc
    }, {})
  )

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
      mockProfile.name = profile.name
      mockProfile.email = profile.email
      mockProfile.username = profile.username

      setActionState((prev) => ({ ...prev, isSavingProfile: false }))
      showMessage('Profile details updated. Connect to your real API to persist changes.')
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

  return (
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
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 md:w-28 md:h-28 border-2 border-foreground bg-card flex items-center justify-center font-mono text-2xl font-bold">
                {mockProfile.avatarInitials}
              </div>
              <div>
                <h2 className="text-2xl font-bold font-mono uppercase tracking-wide">{profile.name}</h2>
                <p className="text-foreground/70">{profile.email}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-mono">
                  <span className="px-3 py-1 border-2 border-foreground bg-primary text-background">{mockProfile.subscription.plan}</span>
                  <span className="px-3 py-1 border-2 border-foreground">Status: {mockProfile.subscription.status}</span>
                  <span className="px-3 py-1 border-2 border-foreground">Billing: {mockProfile.subscription.billingCycle}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full md:w-auto">
              <div className="p-4 border-2 border-foreground bg-card text-center">
                <div className="font-mono text-3xl font-bold">{mockProfile.usage.downloadsThisMonth}</div>
                <p className="text-xs uppercase tracking-wide text-foreground/70">Downloads this month</p>
              </div>
              <div className="p-4 border-2 border-foreground bg-card text-center">
                <div className="font-mono text-3xl font-bold">{mockProfile.usage.favorites}</div>
                <p className="text-xs uppercase tracking-wide text-foreground/70">Favorites saved</p>
              </div>
              <div className="p-4 border-2 border-foreground bg-card text-center">
                <div className="font-mono text-3xl font-bold">{mockProfile.usage.devicesConnected}</div>
                <p className="text-xs uppercase tracking-wide text-foreground/70">Devices connected</p>
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
                  <UserCircleIcon className="w-6 h-6" />
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
                    <PhotoIcon className="w-5 h-5" />
                    <span>Avatar uploads coming soon. Hook into your storage provider later.</span>
                  </div>
                  <label className="inline-flex items-center gap-2 px-4 py-2 border-2 border-foreground bg-card hover:bg-primary hover:text-background transition-colors duration-200 cursor-pointer">
                    <PencilSquareIcon className="w-5 h-5" />
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
                  <ShieldCheckIcon className="w-6 h-6" />
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
                  <LockClosedIcon className="w-5 h-5" />
                  {actionState.isResettingPassword ? 'Sending reset…' : 'Send reset link'}
                </button>
                <button
                  onClick={() => showMessage('Two-factor auth placeholder. Connect to your authentication flow soon.')}
                  className="w-full btn-brutalist px-4 py-3 font-mono font-bold uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-card"
                >
                  <KeyIcon className="w-5 h-5" />
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
                  <CreditCardIcon className="w-6 h-6" />
                  <h3 className="text-lg font-bold font-mono uppercase tracking-wide">Subscription</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono uppercase tracking-wide">
                  <div className="p-4 border-2 border-foreground bg-card flex items-center justify-between">
                    <span>Plan</span>
                    <span>{mockProfile.subscription.plan}</span>
                  </div>
                  <div className="p-4 border-2 border-foreground bg-card flex items-center justify-between">
                    <span>Billing cycle</span>
                    <span>{mockProfile.subscription.billingCycle}</span>
                  </div>
                  <div className="p-4 border-2 border-foreground bg-card flex items-center justify-between">
                    <span>Next renewal</span>
                    <span>{mockProfile.subscription.renewalDate}</span>
                  </div>
                  <div className="p-4 border-2 border-foreground bg-card flex items-center justify-between">
                    <span>Upcoming invoice</span>
                    <span>{mockProfile.subscription.nextInvoice}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => handleSubscriptionAction('upgrade')}
                    disabled={actionState.isUpdatingSubscription}
                    className={cn(
                      'btn-brutalist px-4 py-3 font-mono font-bold uppercase tracking-wide flex items-center justify-center gap-2',
                      actionState.isUpdatingSubscription ? 'opacity-60 cursor-not-allowed' : 'hover:bg-primary hover:text-background'
                    )}
                  >
                    <ArrowUpRightIcon className="w-5 h-5" />
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
                    <ArrowPathIcon className="w-5 h-5" />
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
                    <StarIcon className="w-5 h-5" />
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
                  <BellIcon className="w-6 h-6" />
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
              <DevicePhoneMobileIcon className="w-6 h-6" />
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
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
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
              <CalendarDaysIcon className="w-5 h-5" />
              Refresh activity
            </button>
          </div>
        </FadeInUp>
      </div>
    </div>
  )
}
