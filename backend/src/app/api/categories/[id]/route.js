import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function PUT(request, { params }) {
  const { name, slug, color } = await request.json()
  const category = await prisma.category.update({
    where: { id: Number(params.id) },
    data: { name, slug, color },
  })
  return NextResponse.json(category)
}

export async function DELETE(request, { params }) {
  await prisma.category.delete({ where: { id: Number(params.id) } })
  return NextResponse.json({ ok: true })
}
