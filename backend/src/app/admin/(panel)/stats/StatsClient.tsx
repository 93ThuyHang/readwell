'use client'

import { useState, FormEvent } from 'react'

type Stats = { id: number; books: number; reviews: number; videos: number; recentDays: number }
type Quote = { id: number; quote: string; attribution: string }

export default function StatsClient({
  initialStats,
  initialQuote,
}: {
  initialStats: Stats | null
  initialQuote: Quote | null
}) {
  const [stats, setStats] = useState<Stats>(initialStats || { id: 1, books: 0, reviews: 0, videos: 0, recentDays: 0 })
  const [quote, setQuote] = useState<Quote>(initialQuote || { id: 1, quote: '', attribution: '' })
  const [statsLoading, setStatsLoading] = useState(false)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [statsMsg, setStatsMsg] = useState('')
  const [quoteMsg, setQuoteMsg] = useState('')

  async function handleStatsSubmit(e: FormEvent) {
    e.preventDefault()
    setStatsLoading(true)
    setStatsMsg('')
    const res = await fetch('/api/stats', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stats),
    })
    setStatsLoading(false)
    setStatsMsg(res.ok ? 'Đã cập nhật!' : 'Lỗi khi lưu')
    setTimeout(() => setStatsMsg(''), 3000)
  }

  async function handleQuoteSubmit(e: FormEvent) {
    e.preventDefault()
    setQuoteLoading(true)
    setQuoteMsg('')
    const res = await fetch('/api/featured-quote', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quote),
    })
    setQuoteLoading(false)
    setQuoteMsg(res.ok ? 'Đã cập nhật!' : 'Lỗi khi lưu')
    setTimeout(() => setQuoteMsg(''), 3000)
  }

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Thống kê & Quote nổi bật</h1>
        <p className="text-gray-500 text-sm mt-1">Cập nhật số liệu hiển thị trên trang chủ</p>
      </div>

      {/* Stats */}
      <form onSubmit={handleStatsSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
        <h2 className="text-base font-semibold text-gray-800">Số liệu thống kê</h2>

        <div className="grid grid-cols-2 gap-4">
          {([
            { key: 'books', label: 'Số sách đã đọc' },
            { key: 'reviews', label: 'Số đánh giá' },
            { key: 'videos', label: 'Số video' },
            { key: 'recentDays', label: 'Ngày đọc gần đây (streak)' },
          ] as const).map(({ key, label }) => (
            <div key={key}>
              <label className={labelClass}>{label}</label>
              <input
                type="number"
                min="0"
                value={stats[key]}
                onChange={(e) => setStats((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
                className={inputClass}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={statsLoading}
            className="px-5 py-2 text-sm font-medium text-stone-900 bg-yellow-400 rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50"
          >
            {statsLoading ? 'Đang lưu...' : 'Lưu thống kê'}
          </button>
          {statsMsg && (
            <span className="text-sm text-green-600 font-medium">{statsMsg}</span>
          )}
        </div>
      </form>

      {/* Featured Quote */}
      <form onSubmit={handleQuoteSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
        <h2 className="text-base font-semibold text-gray-800">Quote nổi bật</h2>

        <div>
          <label className={labelClass}>Nội dung quote</label>
          <textarea
            value={quote.quote}
            onChange={(e) => setQuote((prev) => ({ ...prev, quote: e.target.value }))}
            rows={4}
            className={`${inputClass} resize-none`}
            placeholder="Bạn có quyền năng đối với tâm trí của mình..."
          />
        </div>

        <div>
          <label className={labelClass}>Tác giả / Nguồn</label>
          <input
            type="text"
            value={quote.attribution}
            onChange={(e) => setQuote((prev) => ({ ...prev, attribution: e.target.value }))}
            className={inputClass}
            placeholder="Marcus Aurelius — Meditations"
          />
        </div>

        {quote.quote && (
          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
            <p className="text-sm italic text-yellow-900 leading-relaxed">"{quote.quote}"</p>
            {quote.attribution && (
              <p className="text-xs text-yellow-600 mt-2 font-medium">— {quote.attribution}</p>
            )}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={quoteLoading}
            className="px-5 py-2 text-sm font-medium text-stone-900 bg-yellow-400 rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50"
          >
            {quoteLoading ? 'Đang lưu...' : 'Lưu quote'}
          </button>
          {quoteMsg && (
            <span className="text-sm text-green-600 font-medium">{quoteMsg}</span>
          )}
        </div>
      </form>
    </div>
  )
}
