import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getOrCreateProfile } from '@/lib/premium'
import { extractPublicIdFromUrl } from '@/lib/cloudinary'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const profile = await getOrCreateProfile()
    if (!profile) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { id } = await params
    const collection = await db.collection.findUnique({ where: { id } })
    if (!collection || collection.profileId !== profile.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = (await req.json().catch(() => ({}))) as {
      wallpaperId?: string
      cloudinaryPublicId?: string
      url?: string
      sourceUrl?: string
      title?: string
    }

    let publicId = body.cloudinaryPublicId || null
    const sourceUrl = body.sourceUrl || body.url || null
    if (!publicId && sourceUrl) publicId = extractPublicIdFromUrl(sourceUrl)

    const created = await db.collectionItem.create({
      data: {
        collectionId: collection.id,
        wallpaperId: body.wallpaperId ?? null,
        cloudinaryPublicId: publicId,
        sourceUrl: sourceUrl,
      },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (e) {
    console.error('collection items POST error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
