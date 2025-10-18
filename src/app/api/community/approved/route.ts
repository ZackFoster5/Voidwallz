import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const revalidate = 0

export async function GET() {
  try {
    const subs = await db.submission.findMany({
      where: { status: 'APPROVED', wallpaperId: { not: null } },
      include: {
        wallpaper: {
          include: {
            category: true,
            tags: { include: { tag: true } },
            _count: { select: { downloads: true, favorites: true } },
          },
        },
      },
      orderBy: { approvedAt: 'desc' },
      take: 200,
    })

    const wallpapers = subs
      .map((s) => s.wallpaper)
      .filter((w): w is NonNullable<typeof w> => Boolean(w))

    return NextResponse.json({ wallpapers })
  } catch (e) {
    console.error('community approved GET error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
