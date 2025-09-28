export type DeviceType = 'desktop' | 'mobile'

export type WallpaperStatus = 'Draft' | 'Pending Review' | 'Published'

export type WallpaperEntry = {
  id: string
  title: string
  category: string
  status: WallpaperStatus
  curator: string
  deviceType: DeviceType
  lastEdit: string
  createdAt: string
  previewUrl?: string
  featuredUntil?: string
}

const STORAGE_KEY = 'voidwallz:admin-wallpapers'
export const WALLPAPER_UPDATE_EVENT = 'voidwallz:wallpapers-updated'

const isBrowser = typeof window !== 'undefined'

function broadcastUpdate() {
  if (!isBrowser) return
  window.dispatchEvent(new Event(WALLPAPER_UPDATE_EVENT))
}

export function loadStoredWallpapers(): WallpaperEntry[] {
  if (!isBrowser) return []

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed.filter(isValidWallpaperEntry).map((entry) => ({
      ...entry,
      deviceType: entry.deviceType ?? 'desktop',
      previewUrl: typeof entry.previewUrl === 'string' ? entry.previewUrl : undefined,
      createdAt: entry.createdAt ?? new Date().toISOString(),
      lastEdit: entry.lastEdit ?? entry.createdAt ?? new Date().toISOString(),
      featuredUntil: entry.featuredUntil,
    }))
  } catch (error) {
    console.error('Failed to load stored wallpapers', error)
    return []
  }
}

export function saveStoredWallpapers(entries: WallpaperEntry[]) {
  if (!isBrowser) return

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
    broadcastUpdate()
  } catch (error) {
    console.error('Failed to save wallpapers', error)
  }
}

export function appendStoredWallpaper(entry: WallpaperEntry) {
  const existing = loadStoredWallpapers()
  saveStoredWallpapers([entry, ...existing])
}

export function updateStoredWallpaper(updated: WallpaperEntry) {
  const entries = loadStoredWallpapers()
  const next = entries.map((entry) => (entry.id === updated.id ? updated : entry))
  saveStoredWallpapers(next)
}

function isValidWallpaperEntry(entry: unknown): entry is WallpaperEntry {
  if (typeof entry !== 'object' || entry === null) return false

  const candidate = entry as Record<string, unknown>

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.category === 'string' &&
    typeof candidate.status === 'string' &&
    typeof candidate.curator === 'string' &&
    ((candidate.deviceType === 'desktop' || candidate.deviceType === 'mobile') || typeof candidate.deviceType === 'undefined') &&
    typeof candidate.createdAt === 'string'
  )
}
