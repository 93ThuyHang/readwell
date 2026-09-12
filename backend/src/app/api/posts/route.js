import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export const dynamic = 'force-dynamic'

// GET công khai: chỉ trả bài đã đăng và đã tới giờ hẹn (ẩn nháp + bài hẹn giờ chưa tới)
export async function GET() {
  const now = new Date()
  const posts = await prisma.post.findMany({
    where: {
      status: 'published',
      OR: [{ publishAt: null }, { publishAt: { lte: now } }],
    },
    orderBy: { createdAt: 'desc' },
  })
  // videoEmbed is a new column not yet in the cached Prisma client — fetch via raw SQL
  const rows = await prisma.$queryRaw`SELECT id, "videoEmbed" FROM "Post"`
  const videoEmbedMap = Object.fromEntries(rows.map((r) => [r.id, r.videoEmbed]))
  return NextResponse.json(posts.map((p) => ({ ...p, videoEmbed: videoEmbedMap[p.id] ?? null })))
}

// Chuẩn hóa status + publishAt từ body admin
function normalizeSchedule({ status, publishAt }) {
  const normalizedStatus = status === 'draft' ? 'draft' : 'published'
  let normalizedPublishAt = null
  if (normalizedStatus === 'published' && publishAt) {
    const d = new Date(publishAt)
    if (!isNaN(d.getTime())) normalizedPublishAt = d
  }
  return { status: normalizedStatus, publishAt: normalizedPublishAt }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { videoEmbed, status, publishAt, ...rest } = body
    const schedule = normalizeSchedule({ status, publishAt })
    const post = await prisma.post.create({ data: { ...rest, ...schedule } })
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
