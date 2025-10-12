import type { ColorPalette } from './color-extractor'
import { extractColorsFromImage } from './color-extractor'

const paletteCache = new Map<string, ColorPalette>()
const inflightRequests = new Map<string, Promise<ColorPalette>>()

export function buildPaletteCacheKey(id: string, thumbnailPath: string) {
  return `${id}::${thumbnailPath}`
}

export function getCachedPalette(key: string): ColorPalette | undefined {
  return paletteCache.get(key)
}

export function setCachedPalette(key: string, palette: ColorPalette) {
  paletteCache.set(key, palette)
}

export function hasCachedPalette(key: string) {
  return paletteCache.has(key)
}

export async function ensurePalette(
  key: string,
  thumbnailPath: string
): Promise<ColorPalette> {
  const cached = paletteCache.get(key)
  if (cached) {
    return cached
  }

  const existing = inflightRequests.get(key)
  if (existing) {
    return existing
  }

  const request = extractColorsFromImage(thumbnailPath)
    .then((palette) => {
      paletteCache.set(key, palette)
      inflightRequests.delete(key)
      return palette
    })
    .catch((error) => {
      inflightRequests.delete(key)
      throw error
    })

  inflightRequests.set(key, request)

  return request
}

export function clearPaletteCache() {
  paletteCache.clear()
  inflightRequests.clear()
}
