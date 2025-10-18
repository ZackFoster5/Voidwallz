import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getOrCreateProfile, requirePremiumProfile } from '@/lib/premium'

export async function GET() {
  try {
    const profile = await getOrCreateProfile()
    if (!profile) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const playlists = await db.playlist.findMany({
      where: { profileId: profile.id },
      include: { items: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(playlists)
  } catch (e) {
    console.error('playlists GET error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const gate = await requirePremiumProfile()
    if ('error' in gate) return NextResponse.json({ error: gate.error }, { status: gate.status })
    const profile = gate.profile

    const body = (await req.json().catch(() => ({}))) as {
      name: string
      rotationInterval?: 'HOURLY' | 'DAILY' | 'WEEKLY'
      items?: Array<{ wallpaperId?: string; cloudinaryPublicId?: string; sourceUrl?: string; title?: string }>
    }

    if (!body?.name) return NextResponse.json({ error: 'Missing name' }, { status: 400 })

    const created = await db.playlist.create({
      data: {
        profileId: profile.id,
        name: body.name,
        rotationInterval: body.rotationInterval || 'DAILY',
        items: body.items && body.items.length ? {
          create: body.items.map((it, idx) => ({
            wallpaperId: it.wallpaperId ?? null,
            cloudinaryPublicId: it.cloudinaryPublicId ?? null,
            sourceUrl: it.sourceUrl ?? null,
            title: it.title ?? null,
            order: idx,
          }))
        } : undefined,
      },
      include: { items: true },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (e) {
    console.error('playlists POST error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
