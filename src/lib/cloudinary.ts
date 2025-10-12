import crypto from 'node:crypto'

import { formatVoidwallzId, slugify } from '@/lib/utils'

type CloudinaryConfig = {
  cloudName?: string
  apiKey?: string
  apiSecret?: string
}

function getCloudinaryConfig(): CloudinaryConfig {
  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  }
}

export function isCloudinaryConfigured() {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig()
  return Boolean(cloudName && apiKey && apiSecret)
}

function ensureCloudinaryConfig() {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig()

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary credentials are not defined')
  }

  return {
    cloudName,
    apiKey,
    apiSecret,
  }
}

function getAuthHeader(apiKey: string, apiSecret: string) {
  const token = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')
  return `Basic ${token}`
}

export type CloudinaryListOptions = {
  maxResults?: number
  nextCursor?: string
  folder?: string
  prefix?: string
}

export type CloudinaryResource = {
  asset_id: string
  public_id: string
  format: string
  version: number
  resource_type: string
  type: string
  created_at: string
  bytes: number
  width: number
  height: number
  url: string
  secure_url: string
  tags: string[]
  folder?: string
  [key: string]: unknown
}

export type CloudinaryListResponse = {
  resources: CloudinaryResource[]
  next_cursor?: string
  total_count?: number
}

export type CloudinaryUploadResult = {
  publicId: string
  secureUrl: string
  width: number
  height: number
  bytes: number
  format: string
}

type UploadOptions = {
  folder?: string
  publicId?: string
  overwrite?: boolean
}

export async function uploadWallpaperBuffer({
  buffer,
  mimeType,
  filename,
  options = {},
}: {
  buffer: Buffer
  mimeType: string
  filename?: string
  options?: UploadOptions
}): Promise<CloudinaryUploadResult> {
  const { cloudName, apiKey, apiSecret } = ensureCloudinaryConfig()

  const folder = options.folder ?? 'voidwallz/uploads'
  const publicId = options.publicId ?? slugify(filename ?? `voidwallz-${Date.now()}`)
  const timestamp = Math.round(Date.now() / 1000)

  const paramsToSign: Record<string, string> = {
    folder,
    public_id: publicId,
    timestamp: timestamp.toString(),
  }

  if (options.overwrite) {
    paramsToSign.overwrite = 'true'
  }

  const signaturePayload = Object.keys(paramsToSign)
    .sort()
    .map((key) => `${key}=${paramsToSign[key]}`)
    .join('&')

  const signature = crypto
    .createHash('sha1')
    .update(signaturePayload + apiSecret)
    .digest('hex')

  const uploadUrl = new URL(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`)

  const formData = new FormData()
  formData.append('file', new Blob([buffer], { type: mimeType }), filename ?? publicId)
  formData.append('api_key', apiKey)
  formData.append('timestamp', timestamp.toString())
  formData.append('signature', signature)
  formData.append('folder', folder)
  formData.append('public_id', publicId)

  if (options.overwrite) {
    formData.append('overwrite', 'true')
  }

  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Unable to read error body')
    throw new Error(
      `Cloudinary upload failed: ${response.status} ${response.statusText} - ${errorBody}`
    )
  }

  const payload = (await response.json()) as {
    public_id: string
    secure_url: string
    bytes: number
    width: number
    height: number
    format: string
  }

  return {
    publicId: payload.public_id,
    secureUrl: payload.secure_url,
    width: payload.width,
    height: payload.height,
    bytes: payload.bytes,
    format: payload.format,
  }
}

export async function listCloudinaryWallpapers(
  options: CloudinaryListOptions = {}
): Promise<CloudinaryListResponse> {
  if (!isCloudinaryConfigured()) {
    console.warn('Cloudinary environment variables are not configured')
    return { resources: [], next_cursor: undefined, total_count: 0 }
  }

  const { cloudName, apiKey, apiSecret } = ensureCloudinaryConfig()

  const url = new URL(
    `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload`
  )

  url.searchParams.set('max_results', String(options.maxResults ?? 20))
  url.searchParams.set('resource_type', 'image')
  url.searchParams.set('type', 'upload')

  if (options.nextCursor) {
    url.searchParams.set('next_cursor', options.nextCursor)
  }

  if (options.folder) {
    const normalizedFolder = options.folder.endsWith('/')
      ? options.folder
      : `${options.folder}/`
    url.searchParams.set('prefix', normalizedFolder)
  } else if (options.prefix) {
    url.searchParams.set('prefix', options.prefix)
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: getAuthHeader(apiKey, apiSecret),
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Unable to read error body')
    throw new Error(
      `Failed to fetch Cloudinary resources: ${response.status} ${response.statusText} - ${errorBody}`
    )
  }

  const data = (await response.json()) as CloudinaryListResponse

  return {
    resources: data.resources ?? [],
    next_cursor: data.next_cursor,
    total_count: data.total_count,
  }
}

export type CloudinarySearchOptions = {
  maxResults?: number
  nextCursor?: string
}

export async function searchCloudinaryFolder(
  folder: string,
  options: CloudinarySearchOptions = {}
): Promise<CloudinaryListResponse> {
  if (!isCloudinaryConfigured()) {
    console.warn('Cloudinary environment variables are not configured')
    return { resources: [], next_cursor: undefined, total_count: 0 }
  }

  const { cloudName, apiKey, apiSecret } = ensureCloudinaryConfig()

  const url = new URL(
    `https://api.cloudinary.com/v1_1/${cloudName}/resources/search`
  )

  const body = {
    expression: `resource_type:image AND folder="${folder}"`,
    max_results: options.maxResults ?? 100,
    next_cursor: options.nextCursor,
  }

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(apiKey, apiSecret),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Unable to read error body')
    throw new Error(
      `Failed to search Cloudinary resources: ${response.status} ${response.statusText} - ${errorBody}`
    )
  }

  const data = (await response.json()) as CloudinaryListResponse

  return {
    resources: data.resources ?? [],
    next_cursor: data.next_cursor,
    total_count: data.total_count,
  }
}

export type NormalizedCloudinaryWallpaper = {
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

function formatTitle(publicId: string) {
  const name = publicId.split('/').pop() ?? publicId
  return name
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export function normalizeCloudinaryResource(
  resource: CloudinaryResource,
  index = 0
): NormalizedCloudinaryWallpaper {
  const title = formatTitle(resource.public_id)
  const folderCategory = resource.folder
    ? resource.folder.split('/').pop()
    : undefined
  const primaryTag = Array.isArray(resource.tags) ? resource.tags[0] : undefined

  return {
    id: resource.asset_id ?? resource.public_id,
    displayId: formatVoidwallzId(index),
    title,
    slug: slugify(resource.public_id),
    thumbnailPath: resource.secure_url ?? resource.url,
    width: resource.width,
    height: resource.height,
    bytes: resource.bytes,
    format: resource.format,
    tags: Array.isArray(resource.tags) ? resource.tags : [],
    category: (folderCategory || primaryTag || 'general').toLowerCase(),
    createdAt: resource.created_at,
    resolution: `${resource.width}x${resource.height}`,
    folder: resource.folder,
  }
}
