import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getOrCreateProfile } from '@/lib/premium'

export async function GET() {
  try {
    const profile = await getOrCreateProfile()
    if (!profile) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const rows = await db.collection.findMany({
      where: { profileId: profile.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { items: true, children: true } },
      },
    })

    return NextResponse.json(rows)
  } catch (e) {
    console.error('collections GET error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const profile = await getOrCreateProfile()
    if (!profile) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const body = (await req.json().catch(() => ({}))) as { name: string; isPrivate?: boolean; parentId?: string | null }
    if (!body?.name) return NextResponse.json({ error: 'Missing name' }, { status: 400 })

    const created = await db.collection.create({
      data: {
        profileId: profile.id,
        name: body.name,
        isPrivate: !!body.isPrivate,
        parentId: body.parentId ?? null,
      },
    })
    return NextResponse.json(created, { status: 201 })
  } catch (e) {
    console.error('collections POST error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
