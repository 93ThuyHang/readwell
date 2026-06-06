import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import DeletePostButton from './components/DeletePostButton'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 50

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        slug: true,
        title: true,
        categories: true,
        author: true,
        likes: true,
        createdAt: true,
        _count: { select: { commentsList: true } },
      },
    }),
    prisma.post.count(),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bài viết</h1>
          <p className="text-gray-500 text-sm mt-1">{total} bài viết</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="bg-yellow-400 hover:bg-yellow-500 text-stone-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Thêm bài viết
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Tiêu đề
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Danh mục
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Lượt thích
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Bình luận
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Ngày tạo
              </th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {posts.map((post) => (
              <tr key={post.slug} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-800 line-clamp-1 max-w-xs">{post.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{post.slug}</p>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-1">
                    {post.categories.slice(0, 2).map((cat) => (
                      <span
                        key={cat}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-yellow-50 text-yellow-700 font-medium"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-4 text-center text-gray-600">❤️ {post.likes}</td>
                <td className="px-4 py-4 text-center text-gray-600">💬 {post._count.commentsList}</td>
                <td className="px-4 py-4 text-gray-500 text-xs">
                  {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2 justify-end">
                    <Link
                      href={`/admin/posts/${encodeURIComponent(post.slug)}/edit`}
                      className="text-yellow-700 hover:text-yellow-900 text-xs font-medium px-2.5 py-1.5 rounded border border-yellow-300 hover:border-yellow-500 transition-colors"
                    >
                      Sửa
                    </Link>
                    <DeletePostButton slug={post.slug} title={post.title} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {posts.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p>Chưa có bài viết nào</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Trang {page} / {totalPages} &mdash; {total} bài viết
            </p>
            <div className="flex items-center gap-1">
              <Link
                href={`/admin/posts?page=${page - 1}`}
                aria-disabled={page <= 1}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${page <= 1
                  ? 'text-gray-300 pointer-events-none'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                ← Trước
              </Link>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | '...')[]>((acc, p, i, arr) => {
                  if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...')
                  acc.push(p)
                  return acc
                }, [])
                .map((p, i) =>
                  p === '...' ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-gray-300 text-xs">…</span>
                  ) : (
                    <Link
                      key={p}
                      href={`/admin/posts?page=${p}`}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${p === page
                        ? 'bg-yellow-400 text-stone-900'
                        : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                      {p}
                    </Link>
                  )
                )}

              <Link
                href={`/admin/posts?page=${page + 1}`}
                aria-disabled={page >= totalPages}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${page >= totalPages
                  ? 'text-gray-300 pointer-events-none'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                Sau →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
