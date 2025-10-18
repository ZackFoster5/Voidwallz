import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requirePremiumProfile } from '@/lib/premium'

// VoidAI: Upscale job stub. In a worker, pick up queued jobs and process with Real-ESRGAN or a cloud service.
export async function POST(req: NextRequest) {
  try {
    const gate = await requirePremiumProfile()
    if ('error' in gate) return NextResponse.json({ error: gate.error }, { status: gate.status })
    const profile = gate.profile

    const body = (await req.json().catch(() => ({}))) as {
      publicId?: string
      url?: string
      scale?: number // 2x, 4x, etc
    }

    if (!body.publicId && !body.url) {
      return NextResponse.json({ error: 'Provide publicId or url' }, { status: 400 })
    }

    const job = await db.job.create({
      data: {
        profileId: profile.id,
        type: 'UPSCALE',
        payload: { publicId: body.publicId, url: body.url, scale: body.scale ?? 4, model: 'Real-ESRGAN' },
      },
    })

    return NextResponse.json({ id: job.id, status: job.status })
  } catch (e) {
    console.error('voidai/upscale POST error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
