import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const category = searchParams.get('category')
    const tags = searchParams.get('tags')?.split(',').filter(Boolean)
    const minWidth = searchParams.get('minWidth')
    const minHeight = searchParams.get('minHeight')
    const format = searchParams.get('format')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    if (!query && !category && !tags?.length) {
      return NextResponse.json(
        { error: 'Search query, category, or tags required' },
        { status: 400 }
      )
    }

    // Build where clause
    const where: Prisma.WallpaperWhereInput = {
      status: 'PUBLISHED'
    }

    // Text search
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { tags: { some: { tag: { name: { contains: query, mode: 'insensitive' } } } } }
      ]
    }

    // Category filter
    if (category) {
      where.category = {
        slug: category
      }
    }

    // Tags filter
    if (tags?.length) {
      where.tags = {
        some: {
          tag: {
            slug: {
              in: tags
            }
          }
        }
      }
    }

    // Dimension filters
    if (minWidth) {
      where.width = { gte: parseInt(minWidth) }
    }
    if (minHeight) {
      where.height = { gte: parseInt(minHeight) }
    }

    // Format filter
    if (format) {
      where.format = format
    }

    // Search wallpapers
    const [wallpapers, total] = await Promise.all([
      db.wallpaper.findMany({
        where,
        orderBy: [
          { featured: 'desc' },
          { ratingAverage: 'desc' },
          { downloadsCount: 'desc' },
          { createdAt: 'desc' }
        ],
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

    // Get search suggestions if query provided
    let suggestions: string[] = []
    if (query && query.length >= 2) {
      const tagSuggestions = await db.tag.findMany({
        where: {
          name: {
            contains: query,
            mode: 'insensitive'
          }
        },
        take: 5,
        select: {
          name: true
        }
      })
      suggestions = tagSuggestions.map((tag) => tag.name)
    }

    return NextResponse.json({
      wallpapers,
      suggestions,
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
    console.error('Error searching wallpapers:', error)
    return NextResponse.json(
      { error: 'Failed to search wallpapers' },
      { status: 500 }
    )
  }
}
