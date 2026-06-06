import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'

export async function POST(request, { params }) {
  const post = await prisma.post.update({
    where: { slug: params.slug },
    data: { likes: { increment: 1 } },
  })
  return NextResponse.json({ likes: post.likes })
}
