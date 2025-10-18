import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getOrCreateProfile } from '@/lib/premium'

export async function GET(req: NextRequest) {
  try {
    const profile = await getOrCreateProfile()
    if (!profile) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))

    const jobs = await db.job.findMany({
      where: { profileId: profile.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json(jobs)
  } catch (e) {
    console.error('voidai jobs GET error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
