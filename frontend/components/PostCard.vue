<template>
  <article class="post">
    <div class="post-kicker">{{ kicker }}</div>
    <h2 class="post-title">{{ post.title }}</h2>
    <div class="post-date">
      {{ post.date }}
      <span class="sep">·</span>
      {{ post.categories?.[0] ?? '' }}
    </div>

    <!-- Text paragraphs (truncated khi collapsed) -->
    <div class="post-body drop-cap">
      <p v-for="(para, i) in firstParas" :key="i" v-html="para"></p>
    </div>

    <!-- Phần text còn lại: hiện ngay tại đây khi expanded, trước embed -->
    <div v-if="remainingParas.length && !needsCollapse" class="post-body">
      <p v-for="(para, i) in remainingParas" :key="i" v-html="para"></p>
    </div>

    <!-- Nút nằm ngay dưới text bị cắt, trước embed -->
    <button v-if="needsCollapse" class="readmore-btn" @click="expanded = true">
      <ChevronDown :size="14" /> Xem thêm...
    </button>

    <!-- Thu gọn: hiện ngay dưới text khi đã expanded, trước embed -->
    <button v-if="totalChars > COLLAPSE_LIMIT && expanded" class="readmore-btn" @click="expanded = false">
      <ChevronUp :size="14" /> Thu gọn
    </button>

    <!-- Embed luôn hiển thị -->
    <VideoEmbed v-if="post.videoEmbed" :embed="post.videoEmbed" />

    <QuoteEmbed
      v-if="post.embed && !post.bookEmbed"
      :embed="(post.embed as any)"
      @open-video="(q) => $emit('open-video', q)"
    />

    <BookEmbed v-if="post.bookEmbed" :book="(post.bookEmbed as any)" />

    <QuoteEmbed
      v-if="post.embed && post.bookEmbed"
      :embed="(post.embed as any)"
      @open-video="(q) => $emit('open-video', q)"
    />

    <!-- Phần text sau embed: hiện khi expanded -->
    <div v-if="post.afterEmbed && !needsCollapse" class="post-body">
      <p v-html="post.afterEmbed"></p>
    </div>

    <div class="post-footer">
      <div class="pf-tags">
        <span v-for="tag in post.hashtags" :key="tag" class="pf-tag">{{ tag }}</span>
      </div>
      <div class="pf-actions">
        <button :class="['pf-btn', { faved: liked }]" @click="toggleLike" :disabled="liked">
          <Heart :size="13" :fill="liked ? 'currentColor' : 'none'" />
          {{ likeCount > 0 ? likeCount : '' }} Yêu thích
        </button>
        <button class="pf-btn" @click="$emit('toast', 'Đã copy link!')">
          <Share2 :size="13" /> Chia sẻ
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { Heart, Share2, ChevronDown, ChevronUp } from 'lucide-vue-next'

const props = defineProps<{
  post: {
    id: number
    slug?: string
    title: string
    categories?: string[]
    date: string
    author?: string
    readTime?: string
    paragraphs: string[]
    embed?: { quote?: string; attribution?: string; source?: string; [key: string]: unknown } | null
    bookEmbed?: { bookTitle?: string; bookAuthor?: string; [key: string]: unknown } | null
    videoEmbed?: { gradient: string; quote: string; author: string; eyebrow: string; fontSize?: string } | null
    afterEmbed?: string | null
    hashtags: string[]
    likes?: number
    comments?: number
  }
}>()

defineEmits<{
  'open-video': [quote: string]
  'toast': [msg: string]
}>()

const COLLAPSE_LIMIT = 200

function toStr(p: unknown): string {
  if (typeof p === 'string') return p
  if (p && typeof p === 'object') {
    const o = p as Record<string, unknown>
    if (o.type === 'quote') return `<em>"${o.text ?? ''}"${o.author ? ` — ${o.author}` : ''}</em>`
    return String(o.text ?? '')
  }
  return String(p ?? '')
}

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, '')
}

const likeCount = ref(props.post.likes ?? 0)
const liked = ref(false)
const expanded = ref(false)

onMounted(() => {
  const key = `liked:${props.post.slug}`
  if (localStorage.getItem(key)) liked.value = true
})

const kicker = computed(() => {
  const cats = props.post.categories ?? []
  if (!cats.length) return ''
  return cats.join(' · ')
})

const normalizedParas = computed(() =>
  (props.post.paragraphs ?? []).map(toStr)
)

const totalChars = computed(() =>
  normalizedParas.value.reduce((n, p) => n + stripHtml(p).length, 0)
)

const needsCollapse = computed(() => totalChars.value > COLLAPSE_LIMIT && !expanded.value)

const firstParas = computed(() => {
  const paras = normalizedParas.value
  const base = (props.post.embed || props.post.bookEmbed || props.post.videoEmbed)
    ? paras.slice(0, 2)
    : paras

  if (!needsCollapse.value) return base

  let count = 0
  const visible: string[] = []
  for (const p of base) {
    const text = stripHtml(p)
    if (count >= COLLAPSE_LIMIT) break
    if (count + text.length > COLLAPSE_LIMIT) {
      visible.push(text.slice(0, COLLAPSE_LIMIT - count).trimEnd() + '…')
      break
    }
    visible.push(p)
    count += text.length
  }
  return visible
})

const remainingParas = computed(() => {
  if (needsCollapse.value) return []
  const paras = normalizedParas.value
  if (!props.post.embed && !props.post.bookEmbed && !props.post.videoEmbed) return []
  return paras.slice(2)
})

async function toggleLike() {
  if (liked.value || !props.post.slug) return
  liked.value = true
  likeCount.value++
  localStorage.setItem(`liked:${props.post.slug}`, '1')
  try {
    const res = await fetch(`/api/posts/${props.post.slug}/like`, { method: 'POST' })
    if (res.ok) {
      const data = await res.json()
      likeCount.value = data.likes
    }
  } catch {
    liked.value = false
    likeCount.value--
    localStorage.removeItem(`liked:${props.post.slug}`)
  }
}
</script>
