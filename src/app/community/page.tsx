import { Suspense } from 'react'
import Link from 'next/link'
import { db } from '@/lib/db'
import RequireAuth from '@/components/auth/require-auth'
import GalleryClient from '@/app/gallery/gallery-client'

export const revalidate = 0

async function loadApproved() {
  try {
    const subs = await db.submission.findMany({
      where: { status: 'APPROVED', wallpaperId: { not: null } },
      include: {
        wallpaper: {
          include: { category: true, tags: { include: { tag: true } } },
        },
      },
      orderBy: { approvedAt: 'desc' },
      take: 200,
    })

    const baseWallpapers = subs
      .map((s) => s.wallpaper)
      .filter((w): w is NonNullable<typeof w> => Boolean(w))
      .map((w) => ({
        id: w.id,
        title: w.title,
        slug: w.slug,
        thumbnailPath: w.thumbnailPath || w.filePath,
        width: w.width,
        height: w.height,
        category: w.category?.slug ?? 'community',
        tags: (w.tags || []).map((t) => t.tag.name),
        downloads: w.downloadsCount || 0,
        views: 0,
        featured: w.featured,
        resolution: `${w.width}x${w.height}`,
        deviceType: w.width > w.height ? 'desktop' as const : 'mobile' as const,
        createdAt: w.createdAt.toISOString(),
      }))

    return baseWallpapers
  } catch (e) {
    console.error('Community loadApproved fallback', e)
    return []
  }
}

export default async function CommunityPage() {
  const baseWallpapers = await loadApproved()
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading community…</div>}>
      {/* @ts-expect-error Server component embedding client guard */}
      <RequireAuth>
        <div className="px-4 sm:px-6 lg:px-8 mt-6">
          <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto flex items-center justify-between">
            <p className="text-sm font-mono text-foreground/70">Share your wallpaper — submissions are reviewed by our team.</p>
            <Link
              href="/community/submit"
              className="btn-brutalist px-5 py-2 font-mono uppercase tracking-wide inline-flex items-center gap-2"
            >
              Upload wallpaper
            </Link>
          </div>
        </div>
        <GalleryClient baseWallpapers={baseWallpapers} title="COMMUNITY" initialDevice="all" showControls={false} />
      </RequireAuth>
    </Suspense>
  )
}
