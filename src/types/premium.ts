export type Plan = 'FREE' | 'PREMIUM' | 'LIFETIME'

export type RotationInterval = 'HOURLY' | 'DAILY' | 'WEEKLY'

export type DeviceProfile = {
  id: string
  name: string
  deviceType: string
  width: number
  height: number
  scale?: number
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export type PlaylistItem = {
  id: string
  wallpaperId?: string | null
  cloudinaryPublicId?: string | null
  sourceUrl?: string | null
  title?: string | null
  order: number
}

export type Playlist = {
  id: string
  name: string
  rotationInterval: RotationInterval
  createdAt: string
  updatedAt: string
  items: PlaylistItem[]
}

export type Profile = {
  id: string
  supabaseUid: string
  plan: Plan
  planExpiresAt?: string | null
  createdAt: string
  updatedAt: string
}