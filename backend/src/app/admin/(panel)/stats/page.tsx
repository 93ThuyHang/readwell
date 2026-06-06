import { prisma } from '@/lib/prisma'
import StatsClient from './StatsClient'

export const dynamic = 'force-dynamic'

export default async function StatsPage() {
  const [stats, featuredQuote] = await Promise.all([
    prisma.stats.findUnique({ where: { id: 1 } }),
    prisma.featuredQuote.findUnique({ where: { id: 1 } }),
  ])
  return <StatsClient initialStats={stats} initialQuote={featuredQuote} />
}
