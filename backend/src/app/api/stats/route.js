import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET() {
  try {
    const [posts, featuredQuote] = await Promise.all([
      prisma.post.findMany({
        select: { embed: true, bookEmbed: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.featuredQuote.findUnique({ where: { id: 1 } }),
    ])

    // Đếm videoEmbed qua raw SQL vì Prisma client cũ chưa biết field này
    const videoRows = await prisma.$queryRaw`
      SELECT COUNT(*)::int AS count FROM "Post" WHERE "videoEmbed" IS NOT NULL
    `
    const videos = videoRows[0]?.count ?? 0

    const books = posts.filter((p) => p.bookEmbed != null).length

    const reviews = posts.filter((p) => {
      const embed = p.embed
      return embed && typeof embed === 'object' && embed.quote?.trim()
    }).length

    // Tính ngày liên tiếp: nhóm bài theo ngày, đếm streak từ hôm nay lùi về trước
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const postDays = new Set(
      posts.map((p) => {
        const d = new Date(p.createdAt)
        d.setHours(0, 0, 0, 0)
        return d.getTime()
      })
    )

    let recentDays = 0
    const cursor = new Date(today)
    while (postDays.has(cursor.getTime())) {
      recentDays++
      cursor.setDate(cursor.getDate() - 1)
    }
    // Nếu hôm nay chưa có bài, kiểm tra từ hôm qua
    if (recentDays === 0) {
      cursor.setDate(cursor.getDate() - 1)
      while (postDays.has(cursor.getTime())) {
        recentDays++
        cursor.setDate(cursor.getDate() - 1)
      }
    }

    const stats = { books, reviews, videos, recentDays }
    return NextResponse.json({ stats, featuredQuote })
  } catch (e) {
    console.error('[GET /api/stats]', e)
    return NextResponse.json({ stats: null, featuredQuote: null }, { status: 500 })
  }
}

// Giữ PUT để admin vẫn có thể override thủ công nếu cần
export async function PUT(request) {
  try {
    const { books, reviews, videos, recentDays } = await request.json()
    const stats = await prisma.stats.upsert({
      where: { id: 1 },
      update: { books, reviews, videos, recentDays },
      create: { id: 1, books, reviews, videos, recentDays },
    })
    return NextResponse.json(stats)
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
