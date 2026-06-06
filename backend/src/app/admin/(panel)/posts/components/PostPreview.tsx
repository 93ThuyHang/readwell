'use client'

import { useState } from 'react'

type PostType = 'note' | 'quote' | 'video' | 'book'

type PreviewData = {
  title: string
  categories: string[]
  date: string
  author: string
  readTime: string
  paragraphs: string[]
  embed: {
    quote: string
    attribution: string
    source: string
  }
  afterEmbed: string
  bookEmbed: {
    bookTitle: string
    bookAuthor: string
    tags: string[]
    emoji: string
    status: string
    progress: number
    barColor: string
  } | null
  videoEmbed: {
    gradient: string
    quote: string
    author: string
    eyebrow: string
    fontSize?: string
  } | null
  hashtags: string[]
}

const S = {
  ink: '#1e1408',
  ink2: '#4a3728',
  ink3: '#9a7e68',
  ink4: '#c8b09a',
  rust: '#b85020',
  rustS: '#fdeee6',
  bg: '#faf6f1',
  b1: '#e8ddd0',
  playfair: '"Playfair Display", serif',
  lora: '"Lora", serif',
  nunito: '"Nunito", sans-serif',
}

const COLLAPSE_LIMIT = 200

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, '')
}

function buildVisibleParagraphs(paragraphs: string[], limit: number) {
  let count = 0
  const visible: string[] = []
  for (const p of paragraphs) {
    const text = stripHtml(p)
    if (count >= limit) break
    if (count + text.length > limit) {
      visible.push(text.slice(0, limit - count).trimEnd() + '…')
      count = limit
    } else {
      visible.push(p)
      count += text.length
    }
  }
  return visible
}

export default function PostPreview({ data, postType }: { data: PreviewData; postType?: PostType }) {
  const [expanded, setExpanded] = useState(false)

  const kicker = data.categories.filter(Boolean).join(' · ')
  const allParas = data.paragraphs.filter(Boolean)
  const totalChars = allParas.reduce((n, p) => n + stripHtml(p).length, 0)
  const needsCollapse = totalChars > COLLAPSE_LIMIT && !expanded

  const hasEmbed = data.embed?.quote?.trim()
  const firstParas = hasEmbed
    ? (needsCollapse ? buildVisibleParagraphs(data.paragraphs.slice(0, 2), COLLAPSE_LIMIT) : data.paragraphs.slice(0, 2))
    : (needsCollapse ? buildVisibleParagraphs(data.paragraphs, COLLAPSE_LIMIT) : data.paragraphs)
  const restParas = hasEmbed && !needsCollapse ? data.paragraphs.slice(2) : []

  const isEmpty = !data.title && !data.paragraphs.some(Boolean) && !data.embed?.quote && !data.videoEmbed?.quote && !data.bookEmbed?.bookTitle

  return (
    <div style={{ background: S.bg, borderRadius: 16, padding: '32px 28px', fontFamily: S.lora, color: S.ink, minHeight: 400, border: `1px solid ${S.b1}` }}>
      {/* Preview badge */}
      <div style={{ fontFamily: S.nunito, fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: S.ink4, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ flex: 1, height: 1, background: S.b1 }} />
        Preview
        <span style={{ flex: 1, height: 1, background: S.b1 }} />
      </div>

      {isEmpty ? (
        <div style={{ fontFamily: S.nunito, fontSize: 13, color: S.ink4, textAlign: 'center', padding: '40px 0' }}>
          Điền thông tin bài viết để xem preview
        </div>
      ) : (
        <>
          {/* Kicker */}
          {kicker && (
            <div style={{ fontFamily: S.nunito, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: S.rust, marginBottom: 12 }}>
              {kicker}
            </div>
          )}

          {/* Title */}
          {data.title && (
            <h2 style={{ fontFamily: S.playfair, fontSize: 26, fontWeight: 700, lineHeight: 1.3, color: S.ink, letterSpacing: -0.4, marginBottom: 10 }}>
              {data.title}
            </h2>
          )}

          {/* Date */}
          {(data.date || data.categories[0]) && (
            <div style={{ fontFamily: S.nunito, fontSize: 12.5, color: S.ink4, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
              {data.date || 'Ngày đăng'}
              <span style={{ color: S.b1 }}>·</span>
              {data.categories[0] || ''}
            </div>
          )}

          {/* === VIDEO EMBED === */}
          {postType === 'video' && data.videoEmbed?.quote && (
            <div style={{ borderRadius: 14, overflow: 'hidden', background: data.videoEmbed.gradient, padding: '28px 24px', margin: '8px 0 20px' }}>
              <div style={{ fontFamily: S.nunito, fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 14 }}>
                {data.videoEmbed.eyebrow || 'READWELL.'}
              </div>
              <div style={{ fontFamily: S.lora, fontStyle: 'italic', fontSize: data.videoEmbed.fontSize || '21px', lineHeight: 1.6, color: '#fff', marginBottom: 14 }}>
                "{data.videoEmbed.quote}"
              </div>
              <div style={{ fontFamily: S.nunito, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                — {data.videoEmbed.author || 'Tác giả'}
              </div>
            </div>
          )}

          {/* === BOOK EMBED === */}
          {postType === 'book' && data.bookEmbed?.bookTitle && (
            <div style={{ display: 'flex', gap: 16, border: `1px solid ${S.b1}`, borderRadius: 12, padding: '16px 18px', margin: '8px 0 20px', background: '#fff' }}>
              <div style={{ fontSize: 30, flexShrink: 0 }}>{data.bookEmbed.emoji || '📖'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: S.nunito, fontSize: 10, fontWeight: 700, letterSpacing: 1.8, textTransform: 'uppercase', color: S.rust, marginBottom: 4 }}>
                  ✓ {data.bookEmbed.status || 'Đã đọc xong'}
                </div>
                <div style={{ fontFamily: S.playfair, fontSize: 15, fontWeight: 700, color: S.ink }}>{data.bookEmbed.bookTitle}</div>
                <div style={{ fontFamily: S.nunito, fontSize: 12, color: S.ink3, marginTop: 2 }}>{data.bookEmbed.bookAuthor}</div>
                {data.bookEmbed.tags?.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                    {data.bookEmbed.tags.map((tag) => (
                      <span key={tag} style={{ fontFamily: S.nunito, fontSize: 11, fontWeight: 600, color: S.ink3, background: S.rustS, borderRadius: 20, padding: '2px 10px' }}>{tag}</span>
                    ))}
                  </div>
                )}
                {/* Progress bar */}
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, height: 4, background: S.b1, borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${data.bookEmbed.progress}%`, background: data.bookEmbed.barColor || '#2e5878', borderRadius: 4 }} />
                  </div>
                  <span style={{ fontFamily: S.nunito, fontSize: 11, fontWeight: 700, color: data.bookEmbed.barColor || '#2e5878' }}>
                    {data.bookEmbed.progress === 100 ? '✓ Xong' : `${data.bookEmbed.progress}%`}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* === PARAGRAPHS (note / quote / book review) === */}
          {(postType === 'note' || postType === 'quote' || postType === 'book') && (
            <>
              {firstParas.filter(Boolean).map((p, i) => (
                <p
                  key={i}
                  className={i === 0 ? 'preview-drop-cap' : ''}
                  style={{ fontSize: 16, lineHeight: 1.9, color: S.ink2, marginBottom: 18, fontFamily: S.lora }}
                  dangerouslySetInnerHTML={{ __html: p }}
                />
              ))}

              {/* Remaining paragraphs (after embed) */}
              {restParas.filter(Boolean).map((p, i) => (
                <p key={i} style={{ fontSize: 16, lineHeight: 1.9, color: S.ink2, marginBottom: 18, fontFamily: S.lora }} dangerouslySetInnerHTML={{ __html: p }} />
              ))}

              {/* Quote embed (note type) */}
              {postType === 'note' && hasEmbed && (
                <div style={{ margin: '24px 0', padding: '20px 24px', borderLeft: `3px solid ${S.rust}`, background: S.rustS, borderRadius: '0 12px 12px 0' }}>
                  <div style={{ fontFamily: S.lora, fontStyle: 'italic', fontSize: 17, lineHeight: 1.7, color: S.ink, marginBottom: 10 }}>
                    "{data.embed.quote}"
                  </div>
                  <div style={{ fontFamily: S.nunito, fontSize: 12, fontWeight: 700, color: S.ink3 }}>
                    — {data.embed.attribution}
                    {data.embed.source && <span> · {data.embed.source}</span>}
                  </div>
                </div>
              )}

              {/* Quote type: show as centered quote card */}
              {postType === 'quote' && hasEmbed && (
                <div style={{ margin: '24px 0', padding: '28px 24px', borderLeft: `3px solid ${S.rust}`, background: S.rustS, borderRadius: '0 12px 12px 0' }}>
                  <div style={{ fontFamily: S.lora, fontStyle: 'italic', fontSize: 20, lineHeight: 1.7, color: S.ink, marginBottom: 12 }}>
                    "{data.embed.quote}"
                  </div>
                  <div style={{ fontFamily: S.nunito, fontSize: 13, fontWeight: 700, color: S.ink3 }}>
                    — {data.embed.attribution}
                    {data.embed.source && <span> · {data.embed.source}</span>}
                  </div>
                </div>
              )}

              {data.afterEmbed?.trim() && (
                <p style={{ fontSize: 16, lineHeight: 1.9, color: S.ink2, marginBottom: 18, fontFamily: S.lora }} dangerouslySetInnerHTML={{ __html: data.afterEmbed }} />
              )}

              {totalChars > COLLAPSE_LIMIT && (
                <button
                  onClick={() => setExpanded((v) => !v)}
                  style={{ fontFamily: S.nunito, fontSize: 13, fontWeight: 700, color: S.rust, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', marginBottom: 8 }}
                >
                  {expanded ? '↑ Thu gọn' : '↓ Xem thêm...'}
                </button>
              )}
            </>
          )}

          {/* Hashtags */}
          {data.hashtags.filter(Boolean).length > 0 && (
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${S.b1}`, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {data.hashtags.filter(Boolean).map((tag) => (
                <span key={tag} style={{ fontFamily: S.nunito, fontSize: 12, fontWeight: 700, color: S.ink4 }}>#{tag}</span>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
