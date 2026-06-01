import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function PUT(request, { params }) {
  const { approved } = await request.json()
  const comment = await prisma.comment.update({
    where: { id: Number(params.id) },
    data: { approved },
  })
  return NextResponse.json(comment)
}

export async function DELETE(request, { params }) {
  const comment = await prisma.comment.findUnique({ where: { id: Number(params.id) } })
  if (!comment) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await prisma.comment.delete({ where: { id: Number(params.id) } })
  await prisma.post.update({
    where: { id: comment.postId },
    data: { comments: { decrement: 1 } },
  })
  return NextResponse.json({ ok: true })
}
