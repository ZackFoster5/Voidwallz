import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { db } from '@/lib/db'
import { AUTH_COOKIE_NAME, getJwtSecret } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value
    if (!token) return NextResponse.json({ user: null })
    let payload: any
    try {
      payload = jwt.verify(token, getJwtSecret())
    } catch {
      return NextResponse.json({ user: null })
    }
    const user = await db.user.findUnique({ where: { id: payload.sub }, select: { id: true, email: true, username: true, role: true } })
    return NextResponse.json({ user })
  } catch (e) {
    return NextResponse.json({ user: null })
  }
}
