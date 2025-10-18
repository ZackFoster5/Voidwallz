import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  normalizeCloudinaryResource,
  searchCloudinaryFolder,
} from '@/lib/cloudinary'

type TargetPrefix = {
  prefix: string
  deviceType: 'desktop' | 'mobile'
}

function toTarget(prefix: string): TargetPrefix {
  const normalized = prefix.endsWith('/') ? prefix : `${prefix}/`
  const lower = normalized.toLowerCase()
  return {
    prefix: normalized,
    deviceType: lower.includes('phone') ? 'mobile' : 'desktop',
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const limit = parseInt(searchParams.get('limit') || '100')
    const cursor = searchParams.get('cursor') || undefined
    const folderParam = searchParams.get('folder')
    const prefixParam = searchParams.get('prefix')

    let targets: TargetPrefix[]

    if (prefixParam) {
      targets = [toTarget(prefixParam)]
    } else if (folderParam) {
      targets = [toTarget(folderParam)]
    } else {
      targets = [
        toTarget('wallpapers desktop'),
        toTarget('wallpapers phone'),
      ]
    }

    const results = await Promise.all(
      targets.map(async (target) => {
        const folderName = target.prefix.replace(/\/$/, '')
        const response = await searchCloudinaryFolder(folderName, {
          maxResults: limit,
          nextCursor: cursor,
        })

        console.log('[API /wallpapers] fetched', {
          folder: folderName,
          count: response.resources.length,
          next_cursor: response.next_cursor,
        })

        return {
          ...target,
          resources: response.resources,
          nextCursor: response.next_cursor,
        }
      })
    )

    let sequenceIndex = 0

    const wallpapers = results.flatMap(({ resources, deviceType }) =>
      resources.map((resource) => {
        const normalized = normalizeCloudinaryResource(resource, sequenceIndex++)
        return {
          id: normalized.id,
          displayId: normalized.displayId,
          title: normalized.title,
          slug: normalized.slug,
          thumbnailPath: normalized.thumbnailPath,
          width: normalized.width,
          height: normalized.height,
          category: normalized.category,
          tags: normalized.tags,
          downloads: 0,
          views: 0,
          featured: (normalized.tags ?? []).some((t) => ['featured', 'feature'].includes(t.toLowerCase())),
          resolution: normalized.resolution,
          deviceType,
          createdAt: normalized.createdAt,
          bytes: normalized.bytes,
          format: normalized.format,
          folder: normalized.folder,
        }
      })
    )

    // Sort by creation date descending so newest appear first
    wallpapers.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return bTime - aTime
    })

    return NextResponse.json({
      wallpapers,
      pagination: {
        limit,
        nextCursor: results.length === 1 ? results[0].nextCursor ?? null : null,
      },
    })
  } catch (error) {
    console.error('Error fetching Cloudinary wallpapers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wallpapers from Cloudinary' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      categoryId,
      tags,
      filePath,
      thumbnailPath,
      resolutions,
      fileSize,
      width,
      height,
      format,
      status = 'PUBLISHED',
      featured = false
    } = body

    // Create wallpaper
    const wallpaper = await db.wallpaper.create({
      data: {
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description,
        categoryId,
        filePath,
        thumbnailPath,
        resolutions,
        fileSize,
        width,
        height,
        format,
        status,
        featured
      },
      include: {
        category: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    // Add tags if provided
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        // Find or create tag
        const tag = await db.tag.upsert({
          where: { name: tagName },
          update: {},
          create: {
            name: tagName,
            slug: tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
          }
        })

        // Link wallpaper to tag
        await db.wallpaperTag.create({
          data: {
            wallpaperId: wallpaper.id,
            tagId: tag.id
          }
        })
      }
    }

    // Update category wallpaper count
    await db.category.update({
      where: { id: categoryId },
      data: {
        wallpaperCount: {
          increment: 1
        }
      }
    })

    return NextResponse.json(wallpaper, { status: 201 })
  } catch (error) {
    console.error('Error creating wallpaper:', error)
    return NextResponse.json(
      { error: 'Failed to create wallpaper' },
      { status: 500 }
    )
  }
}
