import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getOrCreateProfile } from '@/lib/premium'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const profile = await getOrCreateProfile()
    if (!profile) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const collection = await db.collection.findUnique({
      where: { id: params.id },
      include: { items: true, children: true },
    })
    if (!collection || collection.profileId !== profile.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json(collection)
  } catch (e) {
    console.error('collection GET error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const profile = await getOrCreateProfile()
    if (!profile) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const body = (await req.json().catch(() => ({}))) as { name?: string; isPrivate?: boolean }

    const existing = await db.collection.findUnique({ where: { id: params.id } })
    if (!existing || existing.profileId !== profile.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const updated = await db.collection.update({
      where: { id: params.id },
      data: { name: body.name ?? existing.name, isPrivate: typeof body.isPrivate === 'boolean' ? body.isPrivate : existing.isPrivate },
    })
    return NextResponse.json(updated)
  } catch (e) {
    console.error('collection PATCH error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const profile = await getOrCreateProfile()
    if (!profile) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const existing = await db.collection.findUnique({ where: { id: params.id } })
    if (!existing || existing.profileId !== profile.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await db.collection.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('collection DELETE error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
