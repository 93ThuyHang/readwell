'use client'

import { useState } from 'react'

type Comment = {
  id: number
  author: string
  content: string
  approved: boolean
  createdAt: string
  post: { slug: string; title: string }
}

export default function CommentsClient({ initialComments }: { initialComments: Comment[] }) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all')

  const filtered = comments.filter((c) => {
    if (filter === 'pending') return !c.approved
    if (filter === 'approved') return c.approved
    return true
  })

  async function toggleApprove(id: number, current: boolean) {
    const res = await fetch(`/api/comments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved: !current }),
    })
    if (res.ok) {
      setComments((prev) => prev.map((c) => (c.id === id ? { ...c, approved: !current } : c)))
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Xóa bình luận này?')) return
    const res = await fetch(`/api/comments/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setComments((prev) => prev.filter((c) => c.id !== id))
    }
  }

  const pendingCount = comments.filter((c) => !c.approved).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bình luận</h1>
        <p className="text-gray-500 text-sm mt-1">
          {comments.length} bình luận
          {pendingCount > 0 && (
            <span className="ml-2 bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-medium">
              {pendingCount} chờ duyệt
            </span>
          )}
        </p>
      </div>

      <div className="flex gap-2">
        {(['all', 'pending', 'approved'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-yellow-400 text-stone-900'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {{ all: 'Tất cả', pending: 'Chờ duyệt', approved: 'Đã duyệt' }[f]}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((comment) => (
          <div
            key={comment.id}
            className={`bg-white rounded-xl shadow-sm border p-5 ${
              !comment.approved ? 'border-amber-200' : 'border-gray-100'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-gray-800">{comment.author}</span>
                  <span className="text-gray-400 text-xs">•</span>
                  <span className="text-xs text-gray-400">
                    {new Date(comment.createdAt).toLocaleDateString('vi-VN', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </span>
                  {!comment.approved && (
                    <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-medium">
                      Chờ duyệt
                    </span>
                  )}
                  {comment.approved && (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                      Đã duyệt
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 mt-2 leading-relaxed">{comment.content}</p>
                <p className="text-xs text-yellow-600 mt-2 truncate">
                  📝 {comment.post.title}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleApprove(comment.id, comment.approved)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    comment.approved
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {comment.approved ? 'Hủy duyệt' : 'Duyệt'}
                </button>
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">💬</p>
            <p>Không có bình luận nào</p>
          </div>
        )}
      </div>
    </div>
  )
}
