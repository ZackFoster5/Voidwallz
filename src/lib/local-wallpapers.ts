import path from 'node:path'
import fs from 'node:fs/promises'
import { slugify, formatVoidwallzId } from '@/lib/utils'

export type LocalWallpaper = {
  id: string
  displayId: string
  title: string
  slug: string
  thumbnailPath: string
  width: number
  height: number
  bytes: number
  format: string
  tags: string[]
  category: string
  createdAt: string
  resolution: string
  folder?: string
}

export async function listLocalWallpapers(device: 'mobile' | 'desktop', limit = 200): Promise<LocalWallpaper[]> {
  const folderRel = device === 'mobile' ? 'wallpapers/phone' : 'wallpapers/desktop'
  const dir = path.join(process.cwd(), 'public', folderRel)

  let entries: string[] = []
  try {
    const dirents = await fs.readdir(dir, { withFileTypes: true })
    entries = dirents
      .filter((d) => d.isFile())
      .map((d) => d.name)
      .filter((name) => name.match(/\.(png|jpg|jpeg|webp)$/i))
      .slice(0, limit)
  } catch {
    return []
  }

  // Use known dimensions for our generated assets
  const width = device === 'mobile' ? 1440 : 3840
  const height = device === 'mobile' ? 3120 : 2160

  const wallpapers: LocalWallpaper[] = []
  for (let i = 0; i < entries.length; i++) {
    const filename = entries[i]
    const filePathAbs = path.join(dir, filename)
    const stat = await fs.stat(filePathAbs).catch(() => undefined)
    const bytes = stat?.size ?? 0
    const createdAt = stat?.mtime?.toISOString?.() ?? new Date().toISOString()
    const base = filename.replace(/\.[a-z0-9]+$/i, '')
    const title = base.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

    wallpapers.push({
      id: `local-${device}-${base}`,
      displayId: formatVoidwallzId(i),
      title,
      slug: slugify(base),
      thumbnailPath: `/${folderRel}/${filename}`,
      width,
      height,
      bytes,
      format: (filename.split('.').pop() || 'jpg').toLowerCase(),
      tags: [],
      category: 'abstract',
      createdAt,
      resolution: `${width}x${height}`,
      folder: folderRel,
    })
  }

  return wallpapers
}