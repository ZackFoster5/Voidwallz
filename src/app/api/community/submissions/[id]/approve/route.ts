import { NextRequest, NextResponse } from 'next/server'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { db } from '@/lib/db'
import { AUTH_COOKIE_NAME, getJwtSecret } from '@/lib/auth'
import { slugify, generateResolutions } from '@/lib/utils'

function requireAdmin(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value
  if (!token) return null
  try {
    const payload = jwt.verify(token, getJwtSecret()) as JwtPayload
    const sub = payload?.sub
    return typeof sub === 'string' ? sub : null
  } catch {
    return null
  }
}

async function getOrCreateCategoryBySlug(slug: string, nameFallback?: string) {
  const normalized = slug.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '')
  let cat = await db.category.findUnique({ where: { slug: normalized } })
  if (!cat) {
    cat = await db.category.create({ data: { slug: normalized, name: nameFallback || normalized, description: 'Community' } })
  }
  return cat
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const uid = requireAdmin(req)
    if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const me = await db.user.findUnique({ where: { id: uid } })
    if (!me || (me.role !== 'ADMIN' && me.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = (await req.json().catch(() => ({}))) as { categorySlug?: string; moderationNotes?: string }

    const { id } = await params
    const submission = await db.submission.findUnique({ where: { id } })
    if (!submission) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (submission.status !== 'PENDING') return NextResponse.json({ error: 'Not pending' }, { status: 400 })

    // Resolve category (fallback to 'community')
    const targetSlug = body.categorySlug || submission.categorySlug || 'community'
    const category = await getOrCreateCategoryBySlug(targetSlug, 'Community')

    const title = submission.title || 'Untitled'
    const slug = slugify(title)
    const resolutions = generateResolutions(submission.width, submission.height)

    const wallpaper = await db.wallpaper.create({
      data: {
        title,
        slug,
        description: submission.description || undefined,
        categoryId: category.id,
        filePath: submission.imageSecureUrl,
        thumbnailPath: submission.imageSecureUrl,
        resolutions: resolutions,
        fileSize: submission.bytes,
        width: submission.width,
        height: submission.height,
        format: submission.format,
        status: 'PUBLISHED',
        featured: false,
      },
    })

    // Add tags if provided
    const rawTags = submission.tags as unknown
    const tags: string[] = Array.isArray(rawTags) ? rawTags.map((t) => String(t)) : []
    for (const tagName of tags) {
      const name = String(tagName).trim().toLowerCase()
      if (!name) continue
      const tag = await db.tag.upsert({
        where: { name },
        update: {},
        create: { name, slug: slugify(name) },
      })
      await db.wallpaperTag.create({ data: { wallpaperId: wallpaper.id, tagId: tag.id } })
    }

    await db.category.update({ where: { id: category.id }, data: { wallpaperCount: { increment: 1 } } })

    await db.submission.update({
      where: { id: submission.id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedByUserId: me.id,
        moderationNotes: body.moderationNotes || undefined,
        wallpaperId: wallpaper.id,
      },
    })

    return NextResponse.json({ ok: true, wallpaperId: wallpaper.id })
  } catch (e) {
    console.error('community approve POST error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
