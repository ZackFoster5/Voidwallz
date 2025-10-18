import { NextResponse } from 'next/server'
import { getOrCreateProfile } from '@/lib/premium'

export async function GET() {
  try {
    const profile = await getOrCreateProfile()
    if (!profile) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    return NextResponse.json(profile)
  } catch (e) {
    console.error('profile GET error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
