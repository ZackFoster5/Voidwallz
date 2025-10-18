import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { db } from '@/lib/db'

export function isPremiumPlan(plan: string | null | undefined) {
  return plan === 'PREMIUM' || plan === 'LIFETIME'
}

export async function getServerSupabase() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set() {},
        remove() {},
      },
    }
  )
  const { data } = await supabase.auth.getSession()
  return { supabase, session: data.session }
}

export async function getOrCreateProfile() {
  const { session } = await getServerSupabase()
  if (!session?.user?.id) return null
  const uid = session.user.id
  let profile = await db.profile.findUnique({ where: { supabaseUid: uid } })
  if (!profile) {
    profile = await db.profile.create({ data: { supabaseUid: uid } })
  }
  return profile
}

export async function requirePremiumProfile() {
  const profile = await getOrCreateProfile()
  if (!profile) return { error: 'Not authenticated', status: 401 as const }
  if (!isPremiumPlan(profile.plan)) return { error: 'Premium required', status: 402 as const } // 402 Payment Required
  return { profile }
}
