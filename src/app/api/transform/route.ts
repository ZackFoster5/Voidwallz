import { NextRequest, NextResponse } from 'next/server'
import { extractPublicIdFromUrl, buildCloudinaryUrl, TransformOptions } from '@/lib/cloudinary'
import { db } from '@/lib/db'
import { getOrCreateProfile } from '@/lib/premium'
import { bestCropOptionsForDevice } from '@/lib/crop'

// Proxy Cloudinary transformations with a controlled whitelist of params.
// Example: /api/transform?publicId=folder/name&w=1920&h=1080&fit=fill&g=auto:subject&saturation=20&tint=30:blue
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const urlParam = searchParams.get('url') || undefined
    let publicId = searchParams.get('publicId') || undefined

    if (!publicId && urlParam) publicId = extractPublicIdFromUrl(urlParam) || undefined
    if (!publicId) return NextResponse.json({ error: 'publicId or url required' }, { status: 400 })

    // Optional deviceProfileId override
    const deviceProfileId = searchParams.get('deviceProfileId') || undefined

    let opts: TransformOptions = {}

    if (deviceProfileId) {
      const profile = await getOrCreateProfile()
      if (profile) {
        const dp = await db.deviceProfile.findFirst({ where: { id: deviceProfileId, profileId: profile.id } })
        if (dp) {
          opts = { ...opts, ...bestCropOptionsForDevice({ width: dp.width, height: dp.height }) }
        }
      }
    }

    // Manual overrides; whitelist only known params
    const w = parseInt(searchParams.get('w') || '')
    const h = parseInt(searchParams.get('h') || '')
    if (!Number.isNaN(w)) opts.width = w
    if (!Number.isNaN(h)) opts.height = h

    const fit = searchParams.get('fit') as any
    if (fit && ['fill','pad','fit'].includes(fit)) opts.fit = fit

    const gravity = searchParams.get('g') as any
    if (gravity && ['auto','auto:subject','face','center'].includes(gravity)) opts.gravity = gravity

    const saturation = parseInt(searchParams.get('saturation') || '')
    if (!Number.isNaN(saturation)) opts.saturation = Math.max(-100, Math.min(100, saturation))
    const hue = parseInt(searchParams.get('hue') || '')
    if (!Number.isNaN(hue)) opts.hue = Math.max(-100, Math.min(100, hue))
    const brightness = parseInt(searchParams.get('brightness') || '')
    if (!Number.isNaN(brightness)) opts.brightness = Math.max(-100, Math.min(100, brightness))
    const contrast = parseInt(searchParams.get('contrast') || '')
    if (!Number.isNaN(contrast)) opts.contrast = Math.max(-100, Math.min(100, contrast))

    const tint = searchParams.get('tint') // format: amount:color e.g., 30:blue or 40:#00ffcc
    if (tint) {
      const [amountStr, color] = tint.split(':')
      const amount = parseInt(amountStr)
      if (!Number.isNaN(amount) && color) opts.tint = { amount, color }
    }

    const targetUrl = buildCloudinaryUrl(publicId!, { quality: 'auto', format: 'auto', gravity: 'auto:subject', fit: 'fill', ...opts })

    const upstream = await fetch(targetUrl, { cache: 'no-store' })
    if (!upstream.ok || !upstream.body) {
      const text = await upstream.text().catch(() => '')
      return NextResponse.json({ error: 'Failed upstream', status: upstream.status, text }, { status: 502 })
    }

    const headers = new Headers(upstream.headers)
    headers.set('Cache-Control', 'public, max-age=86400')
    return new Response(upstream.body, { status: 200, headers })
  } catch (e) {
    console.error('transform error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
