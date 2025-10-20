import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getOrCreateProfile } from '@/lib/premium'

function intervalSeconds(interval: 'HOURLY' | 'DAILY' | 'WEEKLY') {
  switch (interval) {
    case 'HOURLY': return 60 * 60
    case 'WEEKLY': return 7 * 24 * 60 * 60
    case 'DAILY':
    default:
      return 24 * 60 * 60
  }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const profile = await getOrCreateProfile()
    if (!profile) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { id } = await params
    const playlist = await db.playlist.findUnique({
      where: { id },
      include: { items: { orderBy: { order: 'asc' } } },
    })
    if (!playlist || playlist.profileId !== profile.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const count = playlist.items.length
    if (!count) return NextResponse.json({ item: null, index: -1, count: 0 })

    const secs = intervalSeconds(playlist.rotationInterval as 'HOURLY' | 'DAILY' | 'WEEKLY')
    const now = Date.now()
    const created = new Date(playlist.createdAt).getTime()
    const idx = Math.floor((now - created) / (secs * 1000)) % count
    const item = playlist.items[idx]

    return NextResponse.json({ index: idx, count, item })
  } catch (e) {
    console.error('playlist current GET error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
