'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Category = { id: number; name: string; slug: string; color: string }

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#6b7280',
]

function slugify(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
}

export default function CategoriesClient({ initialCategories }: { initialCategories: Category[] }) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [loading, setLoading] = useState(false)

  function openCreate() {
    setEditId(null)
    setName('')
    setSlug('')
    setColor(COLORS[0])
    setShowForm(true)
  }

  function openEdit(cat: Category) {
    setEditId(cat.id)
    setName(cat.name)
    setSlug(cat.slug)
    setColor(cat.color)
    setShowForm(true)
  }

  async function handleSave() {
    setLoading(true)
    if (editId) {
      const res = await fetch(`/api/categories/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug, color }),
      })
      if (res.ok) {
        const updated = await res.json()
        setCategories((prev) => prev.map((c) => (c.id === editId ? updated : c)))
      }
    } else {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug, color }),
      })
      if (res.ok) {
        const created = await res.json()
        setCategories((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
      }
    }
    setLoading(false)
    setShowForm(false)
  }

  async function handleDelete(id: number, catName: string) {
    if (!confirm(`Xóa danh mục "${catName}"?`)) return
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setCategories((prev) => prev.filter((c) => c.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Danh mục</h1>
          <p className="text-gray-500 text-sm mt-1">{categories.length} danh mục</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-yellow-400 hover:bg-yellow-500 text-stone-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Thêm danh mục
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4 max-w-lg">
          <h2 className="font-semibold text-gray-800">{editId ? 'Sửa danh mục' : 'Thêm danh mục mới'}</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục</label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); if (!editId) setSlug(slugify(e.target.value)) }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Stoicism"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="stoicism"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Màu sắc</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              disabled={!name || !slug || loading}
              className="px-4 py-2 text-sm font-medium text-stone-900 bg-yellow-400 rounded-lg hover:bg-yellow-500 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Đang lưu...' : 'Lưu'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3"
          >
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-800 truncate">{cat.name}</p>
              <p className="text-xs text-gray-400 truncate">{cat.slug}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => openEdit(cat)} className="text-gray-400 hover:text-yellow-600 p-1 rounded transition-colors text-sm">✏️</button>
              <button onClick={() => handleDelete(cat.id, cat.name)} className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors text-sm">🗑️</button>
            </div>
          </div>
        ))}

        {categories.length === 0 && !showForm && (
          <div className="col-span-4 text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🏷️</p>
            <p>Chưa có danh mục nào</p>
          </div>
        )}
      </div>
    </div>
  )
}
