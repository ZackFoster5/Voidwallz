import { NextResponse } from 'next/server'
import { getOrCreateProfile, getServerSupabase } from '@/lib/premium'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const { session } = await getServerSupabase()
    if (!session?.user) {
      console.log('No session found')
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const profile = await getOrCreateProfile()
    if (!profile) {
      console.log('Failed to get or create profile')
      return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 })
    }

    console.log('Profile stats - User email:', session.user.email)
    console.log('Profile stats - Profile ID:', profile.id)

    // Get user from auth (if using custom User model) - this may not exist for Supabase-only auth
    const user = await db.user.findUnique({
      where: { email: session.user.email! }
    }).catch((err) => {
      console.log('No User model record found (expected for Supabase auth):', err.message)
      return null
    })

    // Calculate downloads this month (only if User model exists)
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    let downloadsThisMonth = 0
    let favoritesCount = 0
    let totalDownloads = 0

    if (user) {
      downloadsThisMonth = await db.download.count({
        where: {
          userId: user.id,
          createdAt: { gte: startOfMonth }
        }
      }).catch(() => 0)

      favoritesCount = await db.favorite.count({
        where: { userId: user.id }
      }).catch(() => 0)

      totalDownloads = await db.download.count({
        where: { userId: user.id }
      }).catch(() => 0)
    }

    // Count devices (device profiles)
    const devicesConnected = await db.deviceProfile.count({
      where: { profileId: profile.id }
    })

    // Count collections
    const collectionsCount = await db.collection.count({
      where: { profileId: profile.id }
    })

    // Count collection items (saved wallpapers)
    const savedWallpapers = await db.collectionItem.count({
      where: {
        collection: {
          profileId: profile.id
        }
      }
    }).catch(() => 0)

    console.log('Stats calculated:', {
      downloadsThisMonth,
      favoritesCount,
      savedWallpapers,
      devicesConnected,
      collectionsCount,
      totalDownloads
    })

    // Get user metadata from Supabase
    const userMeta = session.user.user_metadata || {}
    const firstName = userMeta.firstName || ''
    const lastName = userMeta.lastName || ''
    const displayName = `${firstName} ${lastName}`.trim() || session.user.email?.split('@')[0] || 'User'
    const avatarInitials = firstName && lastName 
      ? `${firstName[0]}${lastName[0]}`.toUpperCase()
      : displayName.slice(0, 2).toUpperCase()

    return NextResponse.json({
      profile: {
        name: displayName,
        email: session.user.email,
        username: userMeta.username || '',
        avatarInitials,
        subscription: {
          plan: profile.plan || 'FREE',
          status: profile.plan && profile.plan !== 'FREE' ? 'Active' : 'Inactive',
          billingCycle: profile.plan === 'LIFETIME' ? 'Lifetime' : 'Yearly',
          renewalDate: profile.planExpiresAt ? new Date(profile.planExpiresAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : 'N/A',
          nextInvoice: profile.plan === 'PREMIUM' ? '$39.99' : '$0.00'
        },
        usage: {
          downloadsThisMonth,
          favorites: favoritesCount || savedWallpapers, // Fallback to collection items if favorites not tracked
          devicesConnected,
          collectionsCount,
          totalDownloads
        }
      }
    })
  } catch (e) {
    console.error('profile stats GET error:', e)
    const errorMessage = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: 'Internal error', details: errorMessage }, { status: 500 })
  }
}
