// Client-side color extraction utilities for theming the preview modal
// Lightweight, no dependencies. Falls back gracefully when CORS/Canvas is blocked.

export type ColorPalette = {
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
  textSecondary: string
}

function clamp(n: number, min = 0, max = 255) {
  return Math.max(min, Math.min(max, n))
}

function rgbToHsv(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const d = max - min
  let h = 0
  const s = max === 0 ? 0 : d / max
  const v = max
  if (d !== 0) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }
  return { h, s, v }
}

function luminance(r: number, g: number, b: number) {
  // Relative luminance (sRGB)
  const Rs = r / 255, Gs = g / 255, Bs = b / 255
  const a = [Rs, Gs, Bs].map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4))
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]
}

function toHex(r: number, g: number, b: number) {
  const c = (x: number) => clamp(Math.round(x)).toString(16).padStart(2, '0')
  return `#${c(r)}${c(g)}${c(b)}`
}

function lighten(hex: string, amount = 0.1) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const nr = clamp(r + 255 * amount)
  const ng = clamp(g + 255 * amount)
  const nb = clamp(b + 255 * amount)
  return toHex(nr, ng, nb)
}

function darken(hex: string, amount = 0.1) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const nr = clamp(r - 255 * amount)
  const ng = clamp(g - 255 * amount)
  const nb = clamp(b - 255 * amount)
  return toHex(nr, ng, nb)
}

function readableTextOn(bgHex: string) {
  const r = parseInt(bgHex.slice(1, 3), 16)
  const g = parseInt(bgHex.slice(3, 5), 16)
  const b = parseInt(bgHex.slice(5, 7), 16)
  const L = luminance(r, g, b)
  return L > 0.5 ? '#1f2937' : '#f8fafc' // slate-800 on light, slate-50 on dark
}

/**
 * Extract a small color palette from an image URL using Canvas sampling.
 * - Returns a palette tuned for UI: primary, secondary, accent, background, text.
 * - Gracefully falls back if canvas is tainted or image fails to load.
 */
export async function extractColorsFromImage(src: string): Promise<ColorPalette> {
  if (typeof window === 'undefined') {
    // SSR fallback
    return DEFAULT_PALETTE
  }

  const img = new Image()
  img.crossOrigin = 'anonymous'

  const loaded: HTMLImageElement = await new Promise((resolve, reject) => {
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Image load error'))
    img.src = src
  })

  // downscale for performance
  const w = 64, h = 64
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return DEFAULT_PALETTE

  try {
    ctx.drawImage(loaded, 0, 0, w, h)
    const { data } = ctx.getImageData(0, 0, w, h)

    // Simple quantization: bucket by 24 and count
    const buckets = new Map<string, { r: number, g: number, b: number, count: number, s: number, v: number }>()
    let avgR = 0, avgG = 0, avgB = 0, n = 0

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3]
      if (a < 200) continue // ignore transparent
      avgR += r; avgG += g; avgB += b; n++
      const br = Math.round(r / 24) * 24
      const bg = Math.round(g / 24) * 24
      const bb = Math.round(b / 24) * 24
      const key = `${br},${bg},${bb}`
      const { s, v } = rgbToHsv(r, g, b)
      const curr = buckets.get(key)
      if (curr) {
        curr.count++
        curr.s += s
        curr.v += v
      } else {
        buckets.set(key, { r: br, g: bg, b: bb, count: 1, s, v })
      }
    }

    if (n === 0) return DEFAULT_PALETTE

    avgR /= n; avgG /= n; avgB /= n

    // Dominant (by count, avoid near-black/near-white)
    let dominant = { r: avgR, g: avgG, b: avgB, score: -1 }
    // Vibrant (high saturation and value)
    let vibrant = { r: avgR, g: avgG, b: avgB, score: -1 }

    for (const bkt of buckets.values()) {
      const lum = luminance(bkt.r, bkt.g, bkt.b)
      const tooExtreme = lum < 0.05 || lum > 0.97
      const domScore = bkt.count * (tooExtreme ? 0.4 : 1)
      if (domScore > dominant.score) dominant = { r: bkt.r, g: bkt.g, b: bkt.b, score: domScore }

      const satAvg = bkt.s / bkt.count
      const valAvg = bkt.v / bkt.count
      const vibScore = satAvg * valAvg * 1000 + bkt.count * 0.1
      if (!tooExtreme && vibScore > vibrant.score) vibrant = { r: bkt.r, g: bkt.g, b: bkt.b, score: vibScore }
    }

    const dominantHex = toHex(dominant.r, dominant.g, dominant.b)
    const vibrantHex = toHex(vibrant.r, vibrant.g, vibrant.b)

    // Background: in AMOLED dark UIs, prefer deep black; otherwise use a softened dominant
    const bg = '#000000'
    const text = readableTextOn(bg)

    const primary = vibrantHex
    const secondary = lighten(vibrantHex, 0.12)
    const accent = dominantHex

    return {
      primary,
      secondary,
      accent,
      background: bg,
      text,
      textSecondary: lighten(text === '#f8fafc' ? '#0b1220' : '#e5e7eb', 0),
    }
  } catch (e) {
    // Tainted canvas or any other error → fallback
    return DEFAULT_PALETTE
  }
}

const DEFAULT_PALETTE: ColorPalette = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  accent: '#f59e0b',
  background: '#000000',
  text: '#f8fafc',
  textSecondary: '#cbd5e1',
}

/**
 * Convert a palette to inline CSS variables for convenience.
 */
export function generateCSSVariables(p: ColorPalette): Record<string, string> {
  return {
    ['--palette-primary']: p.primary,
    ['--palette-secondary']: p.secondary,
    ['--palette-accent']: p.accent,
    ['--palette-background']: p.background,
    ['--palette-text']: p.text,
    ['--palette-text-secondary']: p.textSecondary,
  }
}
