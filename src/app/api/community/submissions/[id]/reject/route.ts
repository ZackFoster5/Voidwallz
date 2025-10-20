import { NextRequest, NextResponse } from 'next/server'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { db } from '@/lib/db'
import { AUTH_COOKIE_NAME, getJwtSecret } from '@/lib/auth'

function requireAdmin(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value
  if (!token) return null
  try {
    const payload = jwt.verify(token, getJwtSecret()) as JwtPayload
    const sub = payload?.sub
    return typeof sub === 'string' ? sub : null
  } catch {
    return null
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const uid = requireAdmin(req)
    if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const me = await db.user.findUnique({ where: { id: uid } })
    if (!me || (me.role !== 'ADMIN' && me.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = (await req.json().catch(() => ({}))) as { moderationNotes?: string }

    const { id } = await params
    const sub = await db.submission.findUnique({ where: { id } })
    if (!sub) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (sub.status !== 'PENDING') return NextResponse.json({ error: 'Not pending' }, { status: 400 })

    await db.submission.update({
      where: { id: sub.id },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
        rejectedByUserId: me.id,
        moderationNotes: body.moderationNotes || undefined,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('community reject POST error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
