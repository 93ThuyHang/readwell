'use client'

import { useRouter } from 'next/navigation'

export default function DeletePostButton({ slug, title }: { slug: string; title: string }) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm(`Xóa bài viết "${title}"? Hành động này không thể hoàn tác.`)) return
    const res = await fetch(`/api/posts/${encodeURIComponent(slug)}`, { method: 'DELETE' })
    if (res.ok) {
      router.refresh()
    } else {
      alert('Xóa thất bại')
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="text-red-500 hover:text-red-700 text-xs font-medium px-2.5 py-1.5 rounded border border-red-200 hover:border-red-400 transition-colors"
    >
      Xóa
    </button>
  )
}
