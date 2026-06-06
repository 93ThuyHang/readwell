import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [postCount, commentCount, pendingCount, categoryCount, stats] = await Promise.all([
    prisma.post.count(),
    prisma.comment.count(),
    prisma.comment.count({ where: { approved: false } }),
    prisma.category.count(),
    prisma.stats.findUnique({ where: { id: 1 } }),
  ])

  const recentPosts = await prisma.post.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: { slug: true, title: true, createdAt: true, likes: true, comments: true },
  })

  const cards = [
    { label: 'Tổng bài viết', value: postCount, icon: '📝', href: '/admin/posts', color: 'indigo' },
    { label: 'Bình luận', value: commentCount, icon: '💬', href: '/admin/comments', color: 'blue' },
    { label: 'Chờ duyệt', value: pendingCount, icon: '⏳', href: '/admin/comments', color: 'amber' },
    { label: 'Danh mục', value: categoryCount, icon: '🏷️', href: '/admin/categories', color: 'green' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Tổng quan hệ thống Readwell</p>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">{card.icon}</span>
              <span className="text-3xl font-bold text-gray-900">{card.value}</span>
            </div>
            <p className="text-sm text-gray-500 mt-3">{card.label}</p>
          </Link>
        ))}
      </div>

      {stats && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Thống kê Frontend</h2>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Sách', value: stats.books },
              { label: 'Đánh giá', value: stats.reviews },
              { label: 'Video', value: stats.videos },
              { label: 'Ngày streak', value: stats.recentDays },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">Bài viết gần đây</h2>
          <Link href="/admin/posts/new" className="text-sm text-yellow-600 hover:text-yellow-700 font-medium">
            + Thêm mới
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {recentPosts.map((post) => (
            <div key={post.slug} className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800 line-clamp-1">{post.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span>❤️ {post.likes}</span>
                <span>💬 {post.comments}</span>
                <Link
                  href={`/admin/posts/${encodeURIComponent(post.slug)}/edit`}
                  className="text-yellow-600 hover:text-yellow-700 font-medium"
                >
                  Sửa
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
