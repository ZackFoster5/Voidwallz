import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getOrCreateProfile } from '@/lib/premium'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const profile = await getOrCreateProfile()
    if (!profile) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { id } = await params
    const job = await db.job.findUnique({ where: { id } })
    if (!job || job.profileId !== profile.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json(job)
  } catch (e) {
    console.error('voidai job detail GET error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
