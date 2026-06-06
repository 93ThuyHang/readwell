'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    setLoading(false)

    if (res.ok) {
      router.push('/admin')
    } else {
      const data = await res.json()
      setError(data.error || 'Đăng nhập thất bại')
    }
  }

  return (
    <div className="fixed inset-0 flex overflow-hidden">
      {/* Left – branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-yellow-300 to-amber-400 p-12 shrink-0">
        <span className="text-stone-800 font-bold text-2xl tracking-tight">Readwell</span>
        <div className="space-y-4">
          <p className="text-stone-700 text-2xl font-light leading-relaxed">
            "Đọc sách là cuộc trò chuyện với những tâm hồn vĩ đại nhất của nhân loại."
          </p>
          <p className="text-stone-500 text-sm">— Nhật ký đọc sách</p>
        </div>
        <p className="text-stone-400 text-xs">© {new Date().getFullYear()} Readwell</p>
      </div>

      {/* Right – form */}
      <div className="flex flex-1 items-center justify-center bg-white p-6">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden text-center">
            <span className="text-slate-900 font-bold text-2xl tracking-tight">Readwell</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">Đăng nhập</h1>
            <p className="text-slate-500 text-sm mt-1">Truy cập trang quản trị Readwell</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">
                <span>⚠</span> {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Tên đăng nhập</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                autoComplete="username"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition"
                placeholder="admin"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 text-stone-900 font-semibold py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
