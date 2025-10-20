import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getOrCreateProfile } from '@/lib/premium'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  try {
    const profile = await getOrCreateProfile()
    if (!profile) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { itemId } = await params
    const item = await db.collectionItem.findUnique({ where: { id: itemId }, include: { collection: true } })
    if (!item || item.collection.profileId !== profile.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await db.collectionItem.delete({ where: { id: itemId } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('collection item DELETE error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
