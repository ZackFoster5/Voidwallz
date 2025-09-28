import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Filters
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')
    const status = searchParams.get('status') || 'PUBLISHED'
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')
    
    // Sorting
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build where clause
    const where: any = {
      status: status as any,
    }

    if (category) {
      where.category = {
        slug: category
      }
    }

    if (tag) {
      where.tags = {
        some: {
          tag: {
            slug: tag
          }
        }
      }
    }

    if (featured === 'true') {
      where.featured = true
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { some: { tag: { name: { contains: search, mode: 'insensitive' } } } } }
      ]
    }

    // Build orderBy clause
    const orderBy: any = {}
    if (sortBy === 'downloads') {
      orderBy.downloadsCount = sortOrder as 'asc' | 'desc'
    } else if (sortBy === 'rating') {
      orderBy.ratingAverage = sortOrder as 'asc' | 'desc'
    } else {
      orderBy[sortBy as string] = sortOrder as 'asc' | 'desc'
    }

    // Fetch wallpapers
    const [wallpapers, total] = await Promise.all([
      db.wallpaper.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: true,
          tags: {
            include: {
              tag: true
            }
          },
          _count: {
            select: {
              downloads: true,
              ratings: true,
              favorites: true
            }
          }
        }
      }),
      db.wallpaper.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      wallpapers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching wallpapers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wallpapers' },
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
