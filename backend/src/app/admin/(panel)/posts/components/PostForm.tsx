'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import PostPreview from './PostPreview'
import RichTextEditor from './RichTextEditor'

type VideoEmbed = {
  gradient: string
  quote: string
  author: string
  eyebrow: string
  fontSize: string
}

type BookEmbed = {
  bookTitle: string
  bookAuthor: string
  tags: string[]
  emoji: string
  status: string
  progress: number
  barColor: string
}

type EmbedData = {
  quote: string
  attribution: string
  source: string
}

type PostData = {
  slug: string
  title: string
  categories: string[]
  date: string
  author: string
  readTime: string
  paragraphs: string[]
  embed: EmbedData
  afterEmbed: string
  bookEmbed: BookEmbed | null
  videoEmbed: VideoEmbed | null
  hashtags: string[]
}

type PostType = 'note' | 'quote' | 'video' | 'book'

const POST_TYPES: { id: PostType; label: string }[] = [
  { id: 'note', label: '📖 Tự sự' },
  { id: 'quote', label: '✦ Quote' },
  { id: 'video', label: '🎬 Video' },
  { id: 'book', label: '📚 Sách' },
]

const GRADIENT_OPTIONS = [
  { label: 'Đêm tím', value: 'linear-gradient(160deg,#1a0d2e,#3d1a56)' },
  { label: 'Rừng đêm', value: 'linear-gradient(160deg,#0a1a0a,#1a4020)' },
  { label: 'Hoàng hôn', value: 'linear-gradient(160deg,#1a1006,#402808)' },
  { label: 'Đại dương', value: 'linear-gradient(160deg,#001828,#003858)' },
]

const defaultPost: PostData = {
  slug: '',
  title: '',
  categories: [],
  date: '',
  author: 'Hương Vũ',
  readTime: '5 phút',
  paragraphs: [''],
  embed: { quote: '', attribution: '', source: '' },
  afterEmbed: '',
  bookEmbed: null,
  videoEmbed: null,
  hashtags: [],
}

const defaultVideoEmbed: VideoEmbed = {
  gradient: 'linear-gradient(160deg,#1a0d2e,#3d1a56)',
  quote: '',
  author: '',
  eyebrow: 'READWELL.',
  fontSize: '21px',
}

const defaultBookEmbed: BookEmbed = {
  bookTitle: '',
  bookAuthor: '',
  tags: [],
  emoji: '',
  status: 'Đã đọc xong',
  progress: 100,
  barColor: '#2e5878',
}

function paragraphsToHtml(paragraphs: string[]): string {
  const filtered = paragraphs.filter(Boolean)
  return filtered.length ? filtered.map((p) => `<p>${p}</p>`).join('') : '<p></p>'
}

function htmlToParagraphs(html: string): string[] {
  const items = html
    .split(/<\/p>/)
    .map((s) => s.replace(/<p[^>]*>/g, '').trim())
    .filter((s) => s && s !== '<br>' && s !== '&nbsp;')
  return items.length ? items : ['']
}

function isoToVietnamese(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return ''
  return `${d} tháng ${m}, ${y}`
}

function vietnameseToIso(viDate: string): string {
  const match = viDate.match(/(\d+)\s+tháng\s+(\d+)[,\s]+(\d{4})/)
  if (!match) return ''
  const [, d, m, y] = match
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function detectPostType(data: Partial<PostData>): PostType {
  if (data.videoEmbed?.quote) return 'video'
  if (data.bookEmbed?.bookTitle) return 'book'
  if (data.embed?.quote && (!data.paragraphs?.some(Boolean) || (data.paragraphs?.filter(Boolean).length ?? 0) <= 1)) return 'quote'
  return 'note'
}

export default function PostForm({
  initialData,
  isEdit,
  availableCategories = [],
}: {
  initialData?: Partial<PostData>
  isEdit?: boolean
  availableCategories?: string[]
}) {
  const router = useRouter()
  const [data, setData] = useState<PostData>({ ...defaultPost, ...initialData })
  const [postType, setPostType] = useState<PostType>(() =>
    initialData ? detectPostType(initialData) : 'note'
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rawHashtags, setRawHashtags] = useState((initialData?.hashtags ?? []).join(', '))
  const [rawBookTags, setRawBookTags] = useState((initialData?.bookEmbed?.tags ?? []).join(', '))
  const [contentExpanded, setContentExpanded] = useState(false)

  function setField<K extends keyof PostData>(key: K, value: PostData[K]) {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  function handlePostTypeChange(type: PostType) {
    setPostType(type)
    if (type === 'video' && !data.videoEmbed) {
      setField('videoEmbed', { ...defaultVideoEmbed })
    }
    if (type === 'book' && !data.bookEmbed) {
      setField('bookEmbed', { ...defaultBookEmbed })
    }
  }

  function handleTitleChange(title: string) {
    setData((prev) => ({
      ...prev,
      title,
      ...(isEdit ? {} : { slug: slugify(title) }),
    }))
  }

  function handleEditorChange(html: string) {
    setField('paragraphs', htmlToParagraphs(html))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const payload: PostData = {
      ...data,
      paragraphs: data.paragraphs.filter((p) => p.trim() !== ''),
      bookEmbed: postType === 'book' ? data.bookEmbed : null,
      videoEmbed: postType === 'video' ? data.videoEmbed : null,
      embed: postType === 'video' || postType === 'book'
        ? { quote: '', attribution: '', source: '' }
        : data.embed,
    }

    const url = isEdit ? `/api/posts/${encodeURIComponent(initialData?.slug ?? '')}` : '/api/posts'
    const method = isEdit ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    setLoading(false)
    if (res.ok) {
      router.push('/admin/posts')
      router.refresh()
    } else {
      const d = await res.json().catch(() => ({}))
      setError(d.error || 'Có lỗi xảy ra')
    }
  }

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  const videoEmbed = data.videoEmbed ?? defaultVideoEmbed
  const bookEmbed = data.bookEmbed ?? defaultBookEmbed

  return (
    <div className="flex gap-6 items-start">
      {/* Left: form */}
      <form onSubmit={handleSubmit} className="space-y-6 flex-1 min-w-0">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        {/* Loại bài viết */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Loại bài viết</h2>
          <div className="flex gap-2 flex-wrap">
            {POST_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handlePostTypeChange(t.id)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                  postType === t.id
                    ? 'bg-yellow-400 border-yellow-400 text-stone-900'
                    : 'bg-white border-gray-300 text-gray-600 hover:border-yellow-400 hover:text-yellow-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Thông tin cơ bản */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-800">Thông tin cơ bản</h2>

          <div>
            <label className={labelClass}>
              Tiêu đề {postType === 'note' && <span className="text-red-400">*</span>}
              {(postType === 'quote' || postType === 'video') && <span className="text-gray-400 font-normal">(tùy chọn)</span>}
            </label>
            <input
              type="text"
              required={postType === 'note' || postType === 'book'}
              value={data.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className={inputClass}
              placeholder={
                postType === 'book' ? 'Tên sách hoặc tiêu đề bài viết'
                : postType === 'quote' ? 'Tiêu đề (để trống nếu muốn)'
                : postType === 'video' ? 'Tiêu đề video (để trống nếu muốn)'
                : 'Tiêu đề bài viết'
              }
            />
          </div>

          <div>
            <label className={labelClass}>Slug</label>
            <input
              type="text"
              readOnly
              value={data.slug}
              className={`${inputClass} bg-gray-50 cursor-default select-all`}
            />
            {!isEdit && <p className="text-xs text-gray-400 mt-1">Tự động sinh từ tiêu đề</p>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Tác giả</label>
              <input type="text" value={data.author} onChange={(e) => setField('author', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Ngày đăng</label>
              <input
                type="date"
                value={vietnameseToIso(data.date)}
                onChange={(e) => setField('date', isoToVietnamese(e.target.value))}
                className={inputClass}
              />
              {data.date && <p className="text-xs text-gray-400 mt-1">{data.date}</p>}
            </div>
            <div>
              <label className={labelClass}>Thời gian đọc</label>
              <input type="text" value={data.readTime} onChange={(e) => setField('readTime', e.target.value)} className={inputClass} placeholder="5 phút" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Danh mục</label>
            {availableCategories.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-1">
                {availableCategories.map((cat) => {
                  const selected = data.categories.includes(cat)
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() =>
                        setField('categories', selected ? data.categories.filter((c) => c !== cat) : [...data.categories, cat])
                      }
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                        selected
                          ? 'bg-yellow-400 border-yellow-400 text-stone-900'
                          : 'bg-white border-gray-300 text-gray-600 hover:border-yellow-400 hover:text-yellow-700'
                      }`}
                    >
                      {selected && <span className="mr-1">✓</span>}
                      {cat}
                    </button>
                  )
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-400 mt-1">Chưa có danh mục. <a href="/admin/categories" className="text-yellow-600 hover:underline">Tạo danh mục</a> trước.</p>
            )}
            {data.categories.length > 0 && (
              <p className="text-xs text-gray-400 mt-2">Đã chọn: {data.categories.join(', ')}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Hashtags</label>
            <input
              type="text"
              value={rawHashtags}
              onChange={(e) => setRawHashtags(e.target.value)}
              onBlur={(e) => setField('hashtags', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
              className={inputClass}
              placeholder="stoicism, mindfulness, tư duy"
            />
            <p className="text-xs text-gray-400 mt-1">Cách nhau bởi dấu phẩy</p>
          </div>
        </div>

        {/* === TỰ SỰ: Nội dung bài viết + embed tùy chọn === */}
        {postType === 'note' && (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-3">
              <h2 className="text-base font-semibold text-gray-800">Nội dung bài viết</h2>
              <p className="text-xs text-gray-400">Hỗ trợ <strong>Bold</strong>, <em>Italic</em>, <u>Underline</u>, danh sách.</p>
              {(() => {
                const totalChars = data.paragraphs.reduce((n, p) => n + p.replace(/<[^>]+>/g, '').length, 0)
                const isLong = totalChars > 200
                return (
                  <div className="relative">
                    <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: isLong && !contentExpanded ? 180 : 'none' }}>
                      <RichTextEditor initialContent={paragraphsToHtml(data.paragraphs)} onChange={handleEditorChange} />
                    </div>
                    {isLong && !contentExpanded && (
                      <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                    )}
                    {isLong && (
                      <button type="button" onClick={() => setContentExpanded((v) => !v)} className="text-xs font-semibold text-yellow-600 hover:text-yellow-700 mt-2">
                        {contentExpanded ? '↑ Thu gọn' : '↓ Xem thêm...'}
                      </button>
                    )}
                  </div>
                )
              })()}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
              <h2 className="text-base font-semibold text-gray-800">Trích dẫn đính kèm <span className="text-gray-400 font-normal text-sm">(tùy chọn)</span></h2>
              <div>
                <label className={labelClass}>Câu trích dẫn</label>
                <textarea
                  value={data.embed.quote}
                  onChange={(e) => setField('embed', { ...data.embed, quote: e.target.value })}
                  rows={3}
                  className={`${inputClass} resize-none`}
                  placeholder="Để trống nếu không có trích dẫn..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Tác giả trích dẫn</label>
                  <input type="text" value={data.embed.attribution} onChange={(e) => setField('embed', { ...data.embed, attribution: e.target.value })} className={inputClass} placeholder="Marcus Aurelius" />
                </div>
                <div>
                  <label className={labelClass}>Nguồn</label>
                  <input type="text" value={data.embed.source} onChange={(e) => setField('embed', { ...data.embed, source: e.target.value })} className={inputClass} placeholder="Meditations" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Đoạn sau trích dẫn</label>
                <textarea
                  value={data.afterEmbed}
                  onChange={(e) => setField('afterEmbed', e.target.value)}
                  rows={2}
                  className={`${inputClass} resize-none`}
                  placeholder="Nội dung tiếp theo sau embed..."
                />
              </div>
            </div>
          </>
        )}

        {/* === QUOTE === */}
        {postType === 'quote' && (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
              <h2 className="text-base font-semibold text-gray-800">Câu trích dẫn</h2>
              <div>
                <label className={labelClass}>Nội dung quote <span className="text-red-400">*</span></label>
                <textarea
                  required
                  value={data.embed.quote}
                  onChange={(e) => setField('embed', { ...data.embed, quote: e.target.value })}
                  rows={4}
                  className={`${inputClass} resize-none`}
                  placeholder="Câu quote bạn muốn lưu lại..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Tác giả</label>
                  <input type="text" value={data.embed.attribution} onChange={(e) => setField('embed', { ...data.embed, attribution: e.target.value })} className={inputClass} placeholder="Marcus Aurelius" />
                </div>
                <div>
                  <label className={labelClass}>Nguồn</label>
                  <input type="text" value={data.embed.source} onChange={(e) => setField('embed', { ...data.embed, source: e.target.value })} className={inputClass} placeholder="Meditations" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-3">
              <h2 className="text-base font-semibold text-gray-800">Cảm nhận <span className="text-gray-400 font-normal text-sm">(tùy chọn)</span></h2>
              <RichTextEditor initialContent={paragraphsToHtml(data.paragraphs)} onChange={handleEditorChange} />
            </div>
          </>
        )}

        {/* === VIDEO === */}
        {postType === 'video' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
            <h2 className="text-base font-semibold text-gray-800">Nội dung video</h2>

            <div>
              <label className={labelClass}>Câu quote <span className="text-red-400">*</span></label>
              <textarea
                required
                value={videoEmbed.quote}
                onChange={(e) => setField('videoEmbed', { ...videoEmbed, quote: e.target.value })}
                rows={3}
                className={`${inputClass} resize-none`}
                placeholder="Câu quote hiển thị trong video..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Tác giả</label>
                <input
                  type="text"
                  value={videoEmbed.author}
                  onChange={(e) => setField('videoEmbed', { ...videoEmbed, author: e.target.value })}
                  className={inputClass}
                  placeholder="Marcus Aurelius"
                />
              </div>
              <div>
                <label className={labelClass}>Eyebrow text</label>
                <input
                  type="text"
                  value={videoEmbed.eyebrow}
                  onChange={(e) => setField('videoEmbed', { ...videoEmbed, eyebrow: e.target.value })}
                  className={inputClass}
                  placeholder="READWELL."
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Màu nền</label>
              <div className="flex gap-3 mt-1 flex-wrap">
                {GRADIENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setField('videoEmbed', { ...videoEmbed, gradient: opt.value })}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                      videoEmbed.gradient === opt.value
                        ? 'border-yellow-400 ring-2 ring-yellow-300'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <span
                      className="w-6 h-6 rounded"
                      style={{ background: opt.value, flexShrink: 0 }}
                    />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass}>Cỡ chữ</label>
              <select
                value={videoEmbed.fontSize}
                onChange={(e) => setField('videoEmbed', { ...videoEmbed, fontSize: e.target.value })}
                className={inputClass}
              >
                <option value="17px">Nhỏ (17px)</option>
                <option value="21px">Vừa (21px)</option>
                <option value="26px">Lớn (26px)</option>
              </select>
            </div>

            {/* Preview inline */}
            <div>
              <label className={labelClass}>Preview</label>
              <div
                className="rounded-xl overflow-hidden"
                style={{
                  background: videoEmbed.gradient,
                  padding: '32px 28px',
                  minHeight: 180,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>
                  {videoEmbed.eyebrow || 'READWELL.'}
                </div>
                <div style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: videoEmbed.fontSize || '21px', lineHeight: 1.6, color: '#fff', marginBottom: 16 }}>
                  "{videoEmbed.quote || 'Câu quote của bạn...'}"
                </div>
                <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                  — {videoEmbed.author || 'Tác giả'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === SÁCH === */}
        {postType === 'book' && (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
              <h2 className="text-base font-semibold text-gray-800">Thông tin sách</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Tên sách <span className="text-red-400">*</span></label>
                  <input
                    required
                    type="text"
                    value={bookEmbed.bookTitle}
                    onChange={(e) => setField('bookEmbed', { ...bookEmbed, bookTitle: e.target.value })}
                    className={inputClass}
                    placeholder="Atomic Habits"
                  />
                </div>
                <div>
                  <label className={labelClass}>Tác giả sách</label>
                  <input
                    type="text"
                    value={bookEmbed.bookAuthor}
                    onChange={(e) => setField('bookEmbed', { ...bookEmbed, bookAuthor: e.target.value })}
                    className={inputClass}
                    placeholder="James Clear"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Emoji bìa</label>
                  <input
                    type="text"
                    value={bookEmbed.emoji}
                    onChange={(e) => setField('bookEmbed', { ...bookEmbed, emoji: e.target.value })}
                    className={inputClass}
                    placeholder="📖"
                  />
                </div>
                <div>
                  <label className={labelClass}>Trạng thái</label>
                  <select
                    value={bookEmbed.status}
                    onChange={(e) => setField('bookEmbed', { ...bookEmbed, status: e.target.value })}
                    className={inputClass}
                  >
                    <option value="Đã đọc xong">Đã đọc xong</option>
                    <option value="Đang đọc">Đang đọc</option>
                    <option value="Muốn đọc">Muốn đọc</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Tiến độ (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={bookEmbed.progress}
                    onChange={(e) => setField('bookEmbed', { ...bookEmbed, progress: Number(e.target.value) })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Tags sách</label>
                <input
                  type="text"
                  value={rawBookTags}
                  onChange={(e) => setRawBookTags(e.target.value)}
                  onBlur={(e) => setField('bookEmbed', { ...bookEmbed, tags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                  className={inputClass}
                  placeholder="habits, productivity, self-help"
                />
                <p className="text-xs text-gray-400 mt-1">Cách nhau bởi dấu phẩy</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-3">
              <h2 className="text-base font-semibold text-gray-800">Cảm nhận về sách <span className="text-gray-400 font-normal text-sm">(tùy chọn)</span></h2>
              <RichTextEditor initialContent={paragraphsToHtml(data.paragraphs)} onChange={handleEditorChange} />
            </div>
          </>
        )}

        <div className="flex items-center justify-end gap-3 pb-4">
          <button
            type="button"
            onClick={() => router.push('/admin/posts')}
            className="px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-sm font-medium text-stone-900 bg-yellow-400 rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50"
          >
            {loading ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo bài viết'}
          </button>
        </div>
      </form>

      {/* Right: preview */}
      <div className="w-[420px] shrink-0 sticky top-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 text-center">Live Preview</p>
        <PostPreview data={data} postType={postType} />
      </div>
    </div>
  )
}
