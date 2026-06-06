import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import PostForm from '../../components/PostForm'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function EditPostPage({ params }: { params: { slug: string } }) {
  const [post, categories] = await Promise.all([
    prisma.post.findUnique({ where: { slug: decodeURIComponent(params.slug) } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ])
  if (!post) notFound()

  const rawEmbed = (post.embed ?? {}) as Record<string, unknown>
  const rawBook = post.bookEmbed as Record<string, unknown> | null
  const rawVideo = post.videoEmbed as Record<string, unknown> | null

  const initialData = {
    slug: post.slug,
    title: post.title,
    categories: post.categories,
    date: post.date,
    author: post.author,
    readTime: post.readTime,
    paragraphs: Array.isArray(post.paragraphs) ? (post.paragraphs as string[]) : [String(post.paragraphs)],
    embed: {
      quote: String(rawEmbed.quote ?? ''),
      attribution: String(rawEmbed.attribution ?? ''),
      source: String(rawEmbed.source ?? ''),
    },
    afterEmbed: post.afterEmbed || '',
    bookEmbed: rawBook ? {
      bookTitle: String(rawBook.bookTitle ?? rawBook.title ?? ''),
      bookAuthor: String(rawBook.bookAuthor ?? rawBook.author ?? ''),
      tags: Array.isArray(rawBook.tags) ? (rawBook.tags as string[]) : [],
      emoji: String(rawBook.emoji ?? ''),
      status: String(rawBook.status ?? 'Đã đọc xong'),
      progress: Number(rawBook.progress ?? 100),
      barColor: String(rawBook.barColor ?? '#2e5878'),
    } : null,
    videoEmbed: rawVideo ? {
      gradient: String(rawVideo.gradient ?? 'linear-gradient(160deg,#1a0d2e,#3d1a56)'),
      quote: String(rawVideo.quote ?? ''),
      author: String(rawVideo.author ?? ''),
      eyebrow: String(rawVideo.eyebrow ?? 'READWELL.'),
      fontSize: String(rawVideo.fontSize ?? '21px'),
    } : null,
    hashtags: post.hashtags,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/posts" className="text-gray-400 hover:text-gray-600 text-sm">
          ← Bài viết
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-2xl font-bold text-gray-900 line-clamp-1">{post.title}</h1>
      </div>
      <PostForm initialData={initialData} isEdit availableCategories={categories.map((c) => c.name)} />
    </div>
  )
}
