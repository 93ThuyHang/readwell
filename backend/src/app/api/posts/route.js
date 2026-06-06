import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET() {
  const posts = await prisma.post.findMany({ orderBy: { createdAt: 'desc' } })
  // videoEmbed is a new column not yet in the cached Prisma client — fetch via raw SQL
  const rows = await prisma.$queryRaw`SELECT id, "videoEmbed" FROM "Post"`
  const videoEmbedMap = Object.fromEntries(rows.map((r) => [r.id, r.videoEmbed]))
  return NextResponse.json(posts.map((p) => ({ ...p, videoEmbed: videoEmbedMap[p.id] ?? null })))
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { videoEmbed, ...rest } = body
    const post = await prisma.post.create({ data: rest })
    if (videoEmbed) {
      await prisma.$executeRaw`UPDATE "Post" SET "videoEmbed" = ${JSON.stringify(videoEmbed)}::jsonb WHERE id = ${post.id}`
    }
    const result = await prisma.post.findUnique({ where: { id: post.id } })
    return NextResponse.json(result, { status: 201 })
  } catch (e) {
    console.error('[POST /api/posts]', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
