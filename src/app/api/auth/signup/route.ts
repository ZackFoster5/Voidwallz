import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, username, password } = body as { email?: string; username?: string; password?: string }

    if (!email || !username || !password) {
      return NextResponse.json({ error: 'email, username and password are required' }, { status: 400 })
    }

    const existing = await db.user.findFirst({ where: { OR: [{ email }, { username }] } })
    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await db.user.create({
      data: { email, username, passwordHash },
      select: { id: true, email: true, username: true, createdAt: true }
    })

    return NextResponse.json({ user })
  } catch (e) {
    console.error('signup error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
