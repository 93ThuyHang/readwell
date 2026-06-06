import { prisma } from '@/lib/prisma'
import PostForm from '../components/PostForm'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function NewPostPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })
  const categoryNames = categories.map((c) => c.name)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/posts" className="text-gray-400 hover:text-gray-600 text-sm">
          ← Bài viết
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-2xl font-bold text-gray-900">Tạo bài viết mới</h1>
      </div>
      <PostForm availableCategories={categoryNames} />
    </div>
  )
}
