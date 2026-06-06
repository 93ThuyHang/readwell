import { prisma } from '@/lib/prisma'
import CommentsClient from './CommentsClient'

export const dynamic = 'force-dynamic'

export default async function CommentsPage() {
  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: 'desc' },
    include: { post: { select: { slug: true, title: true } } },
  })
  return <CommentsClient initialComments={comments} />
}
