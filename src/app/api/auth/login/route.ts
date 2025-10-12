import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { AUTH_COOKIE_NAME, getJwtSecret } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { identifier, password } = body as { identifier?: string; password?: string }

    if (!identifier || !password) {
      return NextResponse.json({ error: 'identifier and password are required' }, { status: 400 })
    }

    const user = await db.user.findFirst({ where: { OR: [{ email: identifier }, { username: identifier }] } })
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })

    const token = jwt.sign({ sub: user.id }, getJwtSecret(), { expiresIn: '7d' })

    const res = NextResponse.json({ user: { id: user.id, email: user.email, username: user.username } })
    res.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })
    return res
  } catch (e) {
    console.error('login error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
