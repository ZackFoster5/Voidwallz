import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getOrCreateProfile } from '@/lib/premium'
import { rateLimit } from '@/lib/rate-limit'
import { uploadWallpaperBuffer, isCloudinaryConfigured } from '@/lib/cloudinary'

const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15MB
const ALLOWED_TYPES = new Set(['image/jpeg','image/jpg','image/png','image/webp'])

export async function GET(req: NextRequest) {
  try {
    const profile = await getOrCreateProfile()
    if (!profile) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') as 'PENDING' | 'APPROVED' | 'REJECTED' | null
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')))

    const submissions = await db.submission.findMany({
      where: { profileId: profile.id, ...(status ? { status } : {}) },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({ submissions })
  } catch (e) {
    console.error('community submissions GET error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isCloudinaryConfigured()) {
      return NextResponse.json({ error: 'Uploads are temporarily unavailable' }, { status: 503 })
    }

    const profile = await getOrCreateProfile()
    if (!profile) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    // Simple rate limit: 5 submissions/hour per profile
    const rl = await rateLimit(`community:submit:${profile.id}`, 5, 60 * 60)
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded. Try again later.' }, { status: 429 })
    }

    const contentType = req.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 })
    }

    const form = await req.formData()
    const file = form.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 415 })
    }
    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Invalid file size (max 15MB)' }, { status: 413 })
    }

    const title = String(form.get('title') || '').slice(0, 120) || 'Untitled'
    const description = String(form.get('description') || '').slice(0, 400) || null
    const rawTags = String(form.get('tags') || '')
    const categorySlug = String(form.get('category') || '').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') || null

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const upload = await uploadWallpaperBuffer({
      buffer,
      mimeType: file.type,
      filename: file.name,
      options: { folder: 'voidwallz/community/pending', overwrite: false },
    })

    const submission = await db.submission.create({
      data: {
        profileId: profile.id,
        title,
        description: description || undefined,
        tags: rawTags ? rawTags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean) : undefined,
        categorySlug: categorySlug || undefined,
        imagePublicId: upload.publicId,
        imageSecureUrl: upload.secureUrl,
        width: upload.width,
        height: upload.height,
        bytes: upload.bytes,
        format: upload.format,
        status: 'PENDING',
      },
    })

    return NextResponse.json({ submission }, { status: 201 })
  } catch (e) {
    console.error('community submissions POST error', e)
    return NextResponse.json({ error: 'Failed to submit wallpaper' }, { status: 500 })
  }
}
