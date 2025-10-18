import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getOrCreateProfile } from '@/lib/premium'

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const profile = await getOrCreateProfile()
    if (!profile) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const id = params.id
    const found = await db.deviceProfile.findUnique({ where: { id } })
    if (!found || found.profileId !== profile.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    await db.deviceProfile.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('device-profiles DELETE error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
