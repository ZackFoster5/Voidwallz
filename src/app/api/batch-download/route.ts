import { NextRequest, NextResponse } from 'next/server'
import { generateCloudinaryZip, extractPublicIdFromUrl } from '@/lib/cloudinary'
import { requirePremiumProfile } from '@/lib/premium'

export async function POST(req: NextRequest) {
  try {
    const gate = await requirePremiumProfile()
    if ('error' in gate) {
      return NextResponse.json({ error: gate.error }, { status: gate.status })
    }

    const body = (await req.json().catch(() => ({}))) as {
      publicIds?: string[]
      urls?: string[]
      name?: string
    }

    const publicIds = new Set<string>()

    for (const id of body.publicIds || []) {
      if (typeof id === 'string' && id.trim()) publicIds.add(id.trim())
    }
    for (const u of body.urls || []) {
      const pid = typeof u === 'string' ? extractPublicIdFromUrl(u) : null
      if (pid) publicIds.add(pid)
    }

    if (!publicIds.size) {
      return NextResponse.json({ error: 'Provide publicIds or urls' }, { status: 400 })
    }

    const { url, expiresAt } = await generateCloudinaryZip([...publicIds], {
      targetPublicId: body.name?.trim() || undefined,
      flattenFolders: true,
      useOriginalFilename: true,
    })

    return NextResponse.json({ url, expiresAt })
  } catch (e) {
    console.error('batch-download error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
