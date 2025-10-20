import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const wallpaper = await db.wallpaper.findUnique({
      where: { id },
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
    })

    if (!wallpaper) {
      return NextResponse.json(
        { error: 'Wallpaper not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(wallpaper)
  } catch (error) {
    console.error('Error fetching wallpaper:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wallpaper' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      categoryId,
      tags,
      status,
      featured
    } = body

    // Update wallpaper
    const { id } = await params
    const wallpaper = await db.wallpaper.update({
      where: { id },
      data: {
        title,
        slug: title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : undefined,
        description,
        categoryId,
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

    // Update tags if provided
    if (tags) {
      // Remove existing tags
      await db.wallpaperTag.deleteMany({
        where: { wallpaperId: id }
      })

      // Add new tags
      for (const tagName of tags) {
        const tag = await db.tag.upsert({
          where: { name: tagName },
          update: {},
          create: {
            name: tagName,
            slug: tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
          }
        })

        await db.wallpaperTag.create({
          data: {
            wallpaperId: id,
            tagId: tag.id
          }
        })
      }
    }

    return NextResponse.json(wallpaper)
  } catch (error) {
    console.error('Error updating wallpaper:', error)
    return NextResponse.json(
      { error: 'Failed to update wallpaper' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get wallpaper to update category count
    const { id } = await params
    const wallpaper = await db.wallpaper.findUnique({
      where: { id },
      select: { categoryId: true }
    })

    if (!wallpaper) {
      return NextResponse.json(
        { error: 'Wallpaper not found' },
        { status: 404 }
      )
    }

    // Delete wallpaper (cascade will handle related records)
    await db.wallpaper.delete({
      where: { id }
    })

    // Update category wallpaper count
    await db.category.update({
      where: { id: wallpaper.categoryId },
      data: {
        wallpaperCount: {
          decrement: 1
        }
      }
    })

    return NextResponse.json({ message: 'Wallpaper deleted successfully' })
  } catch (error) {
    console.error('Error deleting wallpaper:', error)
    return NextResponse.json(
      { error: 'Failed to delete wallpaper' },
      { status: 500 }
    )
  }
}
