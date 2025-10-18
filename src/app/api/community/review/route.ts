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

export async function GET(req: NextRequest) {
  try {
    const uid = requireAdmin(req)
    if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const me = await db.user.findUnique({ where: { id: uid } })
    if (!me || (me.role !== 'ADMIN' && me.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '50')))

    const submissions = await db.submission.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({ submissions })
  } catch (e) {
    console.error('community review GET error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
