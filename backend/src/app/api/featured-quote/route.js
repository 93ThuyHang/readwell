import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

// Không prerender: route đọc/ghi DB, nếu static thì PUT sẽ trả 405 trên Vercel
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Featured quote được admin ghim
    const featured = await prisma.featuredQuote.findUnique({ where: { id: 1 } })

    // Quotes từ các bài viết có embed
    const posts = await prisma.post.findMany({
      select: { embed: true },
      orderBy: { createdAt: 'desc' },
    })

    const postQuotes = posts
      .map((p) => {
        const embed = p.embed
        if (!embed || typeof embed !== 'object') return null
        const q = embed.quote?.trim()
        const a = embed.attribution?.trim()
        if (!q) return null
        return { q, a: a ? `— ${a}` : '' }
      })
      .filter(Boolean)

    const quotes = []
    if (featured?.quote) {
      quotes.push({ q: featured.quote, a: featured.attribution ? `— ${featured.attribution}` : '' })
    }
    // Bỏ trùng lặp
    for (const pq of postQuotes) {
      if (!quotes.some((x) => x.q === pq.q)) quotes.push(pq)
    }

    return NextResponse.json(quotes)
  } catch (e) {
    console.error('[GET /api/featured-quote]', e)
    return NextResponse.json([], { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const { quote, attribution } = await request.json()
    const featuredQuote = await prisma.featuredQuote.upsert({
      where: { id: 1 },
      update: { quote, attribution },
      create: { id: 1, quote, attribution },
    })
    return NextResponse.json(featuredQuote)
  } catch (e) {
    console.error('[PUT /api/featured-quote]', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
