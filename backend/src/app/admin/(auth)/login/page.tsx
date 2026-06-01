'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Mode = 'login' | 'register'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('login')
  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/admin/register')
      .then((r) => r.json())
      .then((d) => {
        setHasAdmin(d.hasAdmin)
        if (!d.hasAdmin) setMode('register')
      })
      .catch(() => setHasAdmin(true))
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const url = mode === 'login' ? '/api/admin/login' : '/api/admin/register'
    const body = mode === 'login'
      ? { username, password }
      : { username, password, confirmPassword }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setLoading(false)

    if (res.ok) {
      router.push('/admin')
    } else {
      const data = await res.json()
      setError(data.error || (mode === 'login' ? 'Đăng nhập thất bại' : 'Đăng ký thất bại'))
    }
  }

  function switchMode(m: Mode) {
    setMode(m)
    setError('')
    setPassword('')
    setConfirmPassword('')
  }

  if (hasAdmin === null) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="w-6 h-6 rounded-full border-2 border-yellow-400 border-t-transparent animate-spin" />
      </div>
    )
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

          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {mode === 'login'
                ? 'Truy cập trang quản trị Readwell'
                : 'Thiết lập tài khoản admin lần đầu'}
            </p>
          </div>

          {/* Tab switcher — chỉ hiện khi đã có admin */}
          {hasAdmin && (
            <div className="flex rounded-xl bg-slate-100 p-1 gap-1">
              {(['login', 'register'] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => switchMode(m)}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                    mode === m
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {m === 'login' ? 'Đăng nhập' : 'Đăng ký'}
                </button>
              ))}
            </div>
          )}

          {/* Form */}
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
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition"
                placeholder="••••••••"
              />
              {mode === 'register' && (
                <p className="text-xs text-slate-400">Tối thiểu 6 ký tự</p>
              )}
            </div>

            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition"
                  placeholder="••••••••"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 text-stone-900 font-semibold py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {loading
                ? (mode === 'login' ? 'Đang đăng nhập...' : 'Đang tạo tài khoản...')
                : (mode === 'login' ? 'Đăng nhập →' : 'Tạo tài khoản →')}
            </button>
          </form>

          {/* Footer link */}
          {hasAdmin && (
            <p className="text-center text-sm text-slate-400">
              {mode === 'login' ? (
                <>Chưa có tài khoản?{' '}
                  <button type="button" onClick={() => switchMode('register')} className="text-yellow-600 hover:underline font-medium">
                    Đăng ký
                  </button>
                </>
              ) : (
                <>Đã có tài khoản?{' '}
                  <button type="button" onClick={() => switchMode('login')} className="text-yellow-600 hover:underline font-medium">
                    Đăng nhập
                  </button>
                </>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
