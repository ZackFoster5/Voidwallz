// Simplified wallpaper type definitions
// Only contains the essential fields: name, upload date, and resolution

export interface Wallpaper {
  id: string
  title: string        // Wallpaper name
  width: number        // Resolution width
  height: number       // Resolution height
  createdAt: string    // Upload date (ISO string)
}

export interface WallpaperFormData {
  title: string
  width: number
  height: number
}

export interface WallpaperApiResponse {
  wallpapers: Wallpaper[]
  pagination?: {
    limit: number
    nextCursor: string | null
  }
}