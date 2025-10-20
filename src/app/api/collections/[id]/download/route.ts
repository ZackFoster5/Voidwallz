import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getOrCreateProfile } from '@/lib/premium'
import { generateCloudinaryZip, extractPublicIdFromUrl } from '@/lib/cloudinary'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const profile = await getOrCreateProfile()
    if (!profile) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { id } = await params
    const collection = await db.collection.findUnique({
      where: { id },
      include: { items: true },
    })
    if (!collection || collection.profileId !== profile.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const publicIds: string[] = []
    for (const it of collection.items) {
      if (it.cloudinaryPublicId) publicIds.push(it.cloudinaryPublicId)
      else if (it.sourceUrl) {
        const pid = extractPublicIdFromUrl(it.sourceUrl)
        if (pid) publicIds.push(pid)
      }
    }

    if (!publicIds.length) return NextResponse.json({ error: 'No Cloudinary-backed items to download' }, { status: 400 })

    const { url, expiresAt } = await generateCloudinaryZip(publicIds, { targetPublicId: `collection-${collection.id}` })
    return NextResponse.json({ url, expiresAt })
  } catch (e) {
    console.error('collection download error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
