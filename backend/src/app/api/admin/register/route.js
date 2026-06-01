import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '../../../../lib/prisma'
import { signToken, COOKIE_NAME } from '../../../../lib/auth'

export async function GET() {
  try {
    const rows = await prisma.$queryRaw`SELECT COUNT(*)::int AS count FROM "AdminUser"`
    return NextResponse.json({ hasAdmin: rows[0].count > 0 })
  } catch (e) {
    console.error('[GET /api/admin/register]', e)
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { username, password, confirmPassword } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Vui lòng nhập đầy đủ thông tin' }, { status: 400 })
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Mật khẩu xác nhận không khớp' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' }, { status: 400 })
    }

    const existing = await prisma.$queryRaw`SELECT id FROM "AdminUser" WHERE username = ${username}`
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Tên đăng nhập đã tồn tại' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    await prisma.$executeRaw`INSERT INTO "AdminUser" (username, "passwordHash", "createdAt") VALUES (${username}, ${passwordHash}, NOW())`

    const token = await signToken({ username, role: 'admin' })
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
    console.error('[POST /api/admin/register]', e)
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}
