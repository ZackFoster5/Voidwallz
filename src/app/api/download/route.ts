import { NextRequest } from 'next/server'
import { getOrCreateProfile, isPremiumPlan } from '@/lib/premium'
import { rateLimit } from '@/lib/rate-limit'

const ALLOWED_HOSTS = new Set([
  'res.cloudinary.com',
  'images.unsplash.com',
])

export async function GET(req: NextRequest) {
  try {
    // Simple rate-limit for free users; premium bypasses
    const profile = await getOrCreateProfile()
    if (!profile || !isPremiumPlan(profile.plan)) {
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'anon'
      const rl = await rateLimit(`download:${ip}`, 30, 60) // 30 downloads/min
      if (!rl.allowed) {
        const retry = Math.max(0, Math.floor((rl.resetAt - Date.now()) / 1000))
        return new Response(JSON.stringify({ error: 'Rate limit exceeded', retryAfter: retry }), {
          status: 429,
          headers: {
            'Retry-After': String(retry),
            'X-RateLimit-Remaining': String(rl.remaining),
            'X-RateLimit-Reset': String(Math.floor(rl.resetAt / 1000)),
          },
        })
      }
    }

    const { searchParams } = new URL(req.url)
    const target = searchParams.get('url')
    const filename = (searchParams.get('filename') || 'wallpaper.jpg').replace(/[^a-z0-9-_.]+/gi, '_')

    if (!target) {
      return new Response(JSON.stringify({ error: 'Missing url' }), { status: 400 })
    }

    let parsed: URL
    try {
      parsed = new URL(target)
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid url' }), { status: 400 })
    }

    if (!ALLOWED_HOSTS.has(parsed.hostname)) {
      return new Response(JSON.stringify({ error: 'Host not allowed' }), { status: 400 })
    }

    const upstream = await fetch(parsed.toString())
    if (!upstream.ok || !upstream.body) {
      const text = await upstream.text().catch(() => '')
      return new Response(JSON.stringify({ error: 'Failed to fetch upstream', status: upstream.status, text }), { status: 502 })
    }

    const headers = new Headers(upstream.headers)
    headers.set('Content-Disposition', `attachment; filename="${filename}"`)
    headers.set('Cache-Control', 'public, max-age=31536000, immutable')

    return new Response(upstream.body, { status: 200, headers })
  } catch (e) {
    console.error('download proxy error', e)
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 })
  }
}
