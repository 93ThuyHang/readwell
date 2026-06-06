import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET(request, { params }) {
  const post = await prisma.post.findUnique({ where: { slug: params.slug } })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const rows = await prisma.$queryRaw`SELECT "videoEmbed" FROM "Post" WHERE id = ${post.id}`
  return NextResponse.json({ ...post, videoEmbed: rows[0]?.videoEmbed ?? null })
}

export async function PUT(request, { params }) {
  try {
    const body = await request.json()
    const { videoEmbed, ...rest } = body
    const post = await prisma.post.update({ where: { slug: params.slug }, data: rest })
    if (videoEmbed !== undefined) {
      await prisma.$executeRaw`UPDATE "Post" SET "videoEmbed" = ${videoEmbed ? JSON.stringify(videoEmbed) : null}::jsonb WHERE id = ${post.id}`
    }
    const result = await prisma.post.findUnique({ where: { id: post.id } })
    return NextResponse.json(result)
  } catch (e) {
    console.error('[PUT /api/posts/:slug]', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  await prisma.post.delete({ where: { slug: params.slug } })
  return NextResponse.json({ ok: true })
}
