import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getOrCreateProfile, requirePremiumProfile } from '@/lib/premium'

export async function GET() {
  try {
    const profile = await getOrCreateProfile()
    if (!profile) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    const rows = await db.deviceProfile.findMany({ where: { profileId: profile.id }, orderBy: { createdAt: 'desc' } })
    return NextResponse.json(rows)
  } catch (e) {
    console.error('device-profiles GET error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const gate = await requirePremiumProfile()
    if ('error' in gate) return NextResponse.json({ error: gate.error }, { status: gate.status })
    const profile = gate.profile
    const body = (await req.json().catch(() => ({}))) as {
      name: string
      deviceType: string
      width: number
      height: number
      scale?: number
      isDefault?: boolean
    }

    if (!body?.name || !body?.deviceType || !body?.width || !body?.height) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (body.isDefault) {
      await db.deviceProfile.updateMany({ where: { profileId: profile.id }, data: { isDefault: false } })
    }

    const created = await db.deviceProfile.create({
      data: {
        profileId: profile.id,
        name: body.name,
        deviceType: body.deviceType,
        width: Math.round(Number(body.width)),
        height: Math.round(Number(body.height)),
        scale: body.scale ? Number(body.scale) : null,
        isDefault: !!body.isDefault,
      },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (e) {
    console.error('device-profiles POST error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
