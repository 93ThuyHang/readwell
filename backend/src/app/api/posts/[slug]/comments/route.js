import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'

export async function GET(request, { params }) {
  const post = await prisma.post.findUnique({ where: { slug: params.slug } })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const comments = await prisma.comment.findMany({
    where: { postId: post.id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(comments)
}

export async function POST(request, { params }) {
  const post = await prisma.post.findUnique({ where: { slug: params.slug } })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const { author, content } = await request.json()
  const comment = await prisma.comment.create({
    data: { postId: post.id, author, content },
  })
  await prisma.post.update({
    where: { id: post.id },
    data: { comments: { increment: 1 } },
  })
  return NextResponse.json(comment, { status: 201 })
}
