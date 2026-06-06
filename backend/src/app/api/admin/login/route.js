import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '../../../../lib/prisma'
import { signToken, COOKIE_NAME } from '../../../../lib/auth'

export async function POST(request) {
  try {
    const { username, password } = await request.json()
    if (!username || !password) {
      return NextResponse.json({ error: 'Vui lòng nhập đầy đủ thông tin' }, { status: 400 })
    }

    const rows = await prisma.$queryRaw`SELECT id, username, "passwordHash" FROM "AdminUser" WHERE username = ${username}`
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Sai tên đăng nhập hoặc mật khẩu' }, { status: 401 })
    }

    const user = rows[0]
    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'Sai tên đăng nhập hoặc mật khẩu' }, { status: 401 })
    }

    const token = await signToken({ username: user.username, role: 'admin' })
    const response = NextResponse.json({ ok: true })
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8,
      path: '/',
    })
    return response
  } catch (e) {
    console.error('[POST /api/admin/login]', e)
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}
