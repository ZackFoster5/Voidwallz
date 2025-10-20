import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { resolution, userId } = body
    
    const userAgent = request.headers.get('user-agent') || ''
    const forwarded = request.headers.get('x-forwarded-for')
    const ipAddress = forwarded ? forwarded.split(',')[0] : 'unknown'

    // Check if wallpaper exists
    const { id } = await params
    const wallpaper = await db.wallpaper.findUnique({
      where: { id }
    })

    if (!wallpaper) {
      return NextResponse.json(
        { error: 'Wallpaper not found' },
        { status: 404 }
      )
    }

    // Create download record
    await db.download.create({
      data: {
        wallpaperId: id,
        userId: userId || null,
        ipAddress,
        userAgent,
        resolution
      }
    })

    // Update wallpaper download count
    await db.wallpaper.update({
      where: { id },
      data: {
        downloadsCount: {
          increment: 1
        }
      }
    })

    return NextResponse.json({ message: 'Download tracked successfully' })
  } catch (error) {
    console.error('Error tracking download:', error)
    return NextResponse.json(
      { error: 'Failed to track download' },
      { status: 500 }
    )
  }
}
