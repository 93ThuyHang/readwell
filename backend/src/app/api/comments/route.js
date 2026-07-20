import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

// Không prerender: danh sách bình luận phải luôn lấy mới từ DB
export const dynamic = 'force-dynamic'

export async function GET() {
  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: 'desc' },
    include: { post: { select: { slug: true, title: true } } },
  })
  return NextResponse.json(comments)
}
