#!/usr/bin/env tsx

import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import sharp from 'sharp'

const DESKTOP_SIZE = { width: 3840, height: 2160 }
const MOBILE_SIZE = { width: 1440, height: 3120 }

const PALETTES: string[][] = [
  ['#0ea5e9', '#1d4ed8', '#7c3aed', '#22d3ee'],
  ['#ef4444', '#f97316', '#f59e0b', '#10b981'],
  ['#111827', '#1f2937', '#4b5563', '#9ca3af'],
  ['#22c55e', '#10b981', '#14b8a6', '#06b6d4'],
  ['#f472b6', '#a78bfa', '#60a5fa', '#34d399'],
  ['#fb7185', '#f59e0b', '#84cc16', '#22d3ee'],
  ['#0ea5e9', '#38bdf8', '#818cf8', '#f472b6'],
  ['#111827', '#0ea5e9', '#22c55e', '#f59e0b'],
]

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick<T>(arr: T[]): T { return arr[randInt(0, arr.length - 1)] }

function hash(n = 8) { return crypto.randomBytes(Math.ceil(n/2)).toString('hex').slice(0, n) }

function buildSvg(width: number, height: number, palette: string[]): string {
  // Randomize gradient angles and positions
  const g1 = pick(palette)
  const g2 = pick(palette.filter(c => c !== g1))
  const g3 = pick(palette.filter(c => c !== g1 && c !== g2))
  const angle = randInt(0, 360)
  const r1 = randInt(30, 60)
  const r2 = randInt(20, 50)
  const r3 = randInt(15, 40)
  const cx1 = randInt(20, 80)
  const cy1 = randInt(20, 80)
  const cx2 = randInt(0, 100)
  const cy2 = randInt(0, 100)

  // Use SVG gradients and soft-light overlays
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" gradientTransform="rotate(${angle})">
      <stop offset="0%" stop-color="${g1}"/>
      <stop offset="100%" stop-color="${g2}"/>
    </linearGradient>
    <radialGradient id="glow1" cx="${cx1}%" cy="${cy1}%" r="${r1}%">
      <stop offset="0%" stop-color="${g3}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="${g3}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="${cx2}%" cy="${cy2}%" r="${r2}%">
      <stop offset="0%" stop-color="${g2}" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="${g2}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <circle cx="${Math.floor(width*cx1/100)}" cy="${Math.floor(height*cy1/100)}" r="${Math.floor(Math.min(width,height)*r1/100)}" fill="url(#glow1)"/>
  <circle cx="${Math.floor(width*cx2/100)}" cy="${Math.floor(height*cy2/100)}" r="${Math.floor(Math.min(width,height)*r2/100)}" fill="url(#glow2)"/>
  <g opacity="0.25">
    <rect x="${-width}" y="${-height}" width="${width*3}" height="${height*3}" fill="none" stroke="${g3}" stroke-opacity="0.08" stroke-width="${randInt(1,3)}" transform="rotate(${angle} ${width/2} ${height/2})"/>
  </g>
</svg>`
}

async function ensureDir(p: string) {
  await fs.mkdir(p, { recursive: true })
}

async function saveBatch(kind: 'desktop' | 'phone', count: number) {
  const size = kind === 'desktop' ? DESKTOP_SIZE : MOBILE_SIZE
  const outDir = path.join(process.cwd(), 'public', 'wallpapers', kind === 'desktop' ? 'desktop' : 'phone')
  await ensureDir(outDir)

  for (let i = 0; i < count; i++) {
    const palette = pick(PALETTES)
    const svg = buildSvg(size.width, size.height, palette)
    const id = `${kind}-${hash(6)}`
    const filename = `${id}.jpg`
    const outPath = path.join(outDir, filename)

    const buffer = await sharp(Buffer.from(svg))
      .jpeg({ quality: 85, progressive: true, mozjpeg: true })
      .toBuffer()

    await fs.writeFile(outPath, buffer)
  }
}

async function main() {
  const desktopCount = Number(process.env.DESKTOP_COUNT || 50)
  const phoneCount = Number(process.env.PHONE_COUNT || 50)
  await saveBatch('desktop', desktopCount)
  await saveBatch('phone', phoneCount)
  console.log(`Generated ${desktopCount} desktop and ${phoneCount} phone wallpapers in public/wallpapers/*`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})