<template>
  <div>
    <AppHeader />

    <div class="page-grid">
      <!-- HERO -->
      <div class="full-width">
        <HeroSection :data="statsData" />
      </div>

      <!-- DAILY QUOTE BANNER -->
      <div class="full-width">
        <QuoteBanner @open-video="openVideo" />
      </div>

      <!-- SECTION TITLE -->
      <div class="full-width sec-title" style="margin-bottom:0">Bài viết gần đây</div>

      <!-- LEFT SIDEBAR -->
      <aside class="margin-col">
        <div>
          <div class="margin-label">Chủ đề</div>
          <span
            v-for="tag in tags"
            :key="tag"
            :class="['margin-tag', { on: activeTags.includes(tag) }]"
            @click="toggleTag(tag)"
          >#{{ tag }}</span>
        </div>

        <div class="margin-streak">
          <div class="ms-fire"><Flame :size="20" /></div>
          <div class="ms-n">{{ statsData?.recentDays ?? 7 }}</div>
          <div class="ms-t">ngày liên tiếp</div>
        </div>

        <div>
          <div class="margin-label">Quote gần đây</div>
          <div v-for="mq in miniQuotes" :key="mq.text" class="margin-quote" style="margin-bottom:16px">
            <div class="mq-mini">"{{ mq.text }}"</div>
            <div class="mq-mini-src">{{ mq.src }}</div>
          </div>
        </div>
      </aside>

      <!-- MAIN CONTENT -->
      <div class="main-col">
        <div v-if="pending" style="padding:80px 0;text-align:center;font-family:'Nunito',sans-serif;font-size:13px;color:var(--ink4)">Đang tải...</div>
        <div v-else-if="error" style="padding:80px 0;text-align:center;font-family:'Nunito',sans-serif;font-size:13px;color:var(--ink4)">Không thể tải bài viết.</div>
        <template v-else>
          <PostCard
            v-for="post in posts"
            :key="post.id"
            :post="post"
            @open-video="openVideo"
            @toast="showToast"
          />
        </template>
      </div>

      <!-- RIGHT TOC -->
      <aside class="toc-col">
        <div class="toc-block">
          <div class="toc-title">Trong trang này</div>
          <button
            v-for="(post, i) in posts.slice(0, 6)"
            :key="post.id"
            :class="['toc-item', { reading: activeToc === i }]"
            @click="scrollToPost(i)"
          >
            <span class="toc-dot"></span>{{ post.title }}
          </button>
        </div>

        <div class="toc-mini-quote">
          <div class="tmq-text">"{{ miniQuotes[0].text }}"</div>
          <div class="tmq-src">{{ miniQuotes[0].src }}</div>
        </div>

        <div class="toc-block">
          <div class="toc-title">Tủ sách</div>
          <button v-for="book in bookshelf" :key="book.title" class="toc-item" @click="showToast('📖 ' + book.title)">
            <span class="toc-dot" :style="{ background: book.color }"></span>{{ book.title }}
          </button>
        </div>

        <div class="toc-block">
          <div class="toc-title">Bài viết hay nhất</div>
          <button v-for="fav in favPosts" :key="fav" class="toc-item" @click="scrollToTop">
            <span class="toc-dot"></span>{{ fav }}
          </button>
        </div>
      </aside>
    </div>

    <AppFooter />

    <!-- TOAST -->
    <div :class="['toast', { show: toastVisible }]">{{ toastMsg }}</div>
  </div>
</template>

<script setup lang="ts">
import { Flame } from 'lucide-vue-next'

const { posts, statsData, pending, error, fetchAll } = usePosts()
await fetchAll()

// Tags
const tags = ['Stoicism', 'TâmLý', 'Mindfulness', 'Triết học', 'Kinh doanh', 'VănHọc']
const activeTags = ref(['Stoicism'])
function toggleTag(tag: string) {
  const i = activeTags.value.indexOf(tag)
  if (i >= 0) activeTags.value.splice(i, 1)
  else activeTags.value.push(tag)
}

// Mini quotes in sidebar
const miniQuotes = [
  { text: 'Hạnh phúc không phải là đích đến, mà là cách bạn đi.', src: 'Marcus Aurelius' },
  { text: 'Đơn giản là sức mạnh tối cao.', src: 'Leonardo da Vinci' },
  { text: 'Mỗi cuốn sách bạn đọc là một cuộc đời bạn sống thêm.', src: 'G.R.R. Martin' },
]

// Bookshelf in TOC
const bookshelf = [
  { title: 'Meditations', color: 'var(--rust)' },
  { title: 'Atomic Habits', color: '#b07820' },
  { title: 'Thinking, Fast & Slow', color: '#2e5878' },
  { title: 'The Power of Now', color: '#3e6645' },
  { title: 'Ikigai', color: '#8a4060' },
]
const favPosts = ['Về sự kiên nhẫn và thời gian', 'Tại sao mình đọc sách mỗi sáng', '12 câu quote thay đổi cách nhìn']

// TOC scrollspy
const activeToc = ref(0)
function scrollToPost(i: number) {
  const els = document.querySelectorAll('.post')
  if (els[i]) els[i].scrollIntoView({ behavior: 'smooth', block: 'start' })
}
function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }) }

onMounted(() => {
  window.addEventListener('scroll', () => {
    const els = document.querySelectorAll('.post')
    let cur = 0
    els.forEach((el, i) => {
      if (el.getBoundingClientRect().top < 160) cur = i
    })
    activeToc.value = cur
  }, { passive: true })
})

// Write modal
const writeOpen = ref(false)
const writeType = ref('note')
const writeTypes = [
  { id: 'note', label: '📖 Tự sự' },
  { id: 'quote', label: '✦ Quote' },
  { id: 'book', label: '📚 Sách' },
  { id: 'video', label: '🎬 Video' },
]
const form = ref({ title: '', content: '', quote: '', author: '' })

async function savePost() {
  const mainText = form.value.title || form.value.quote || form.value.content || ''
  if (!mainText.trim()) { showToast('Vui lòng nhập nội dung!'); return }

  const slug = mainText.trim().toLowerCase().replace(/[^a-z0-9À-ɏ]+/g, '-').slice(0, 60) + '-' + Date.now()
  const now = new Date()
  const date = `${now.getDate()} tháng ${now.getMonth() + 1}, ${now.getFullYear()}`

  const paragraphs = form.value.content
    ? form.value.content.split('\n').filter(p => p.trim()).map(p => ({ type: 'p', text: p }))
    : []
  if (form.value.quote) paragraphs.push({ type: 'quote', text: form.value.quote, author: form.value.author })

  try {
    await $fetch('/api/posts', {
      method: 'POST',
      body: {
        slug,
        title: form.value.title || form.value.quote || 'Không có tiêu đề',
        categories: [writeType.value],
        date,
        author: form.value.author || 'Hangngo',
        readTime: '1 phút',
        paragraphs,
        embed: {},
        hashtags: [],
      }
    })
    showToast('✦ Đã lưu bài viết!')
    form.value = { title: '', content: '', quote: '', author: '' }
    writeOpen.value = false
    await fetchAll()
  } catch {
    showToast('Lỗi khi lưu, thử lại nhé!')
  }
}

// Video modal
const videoOpen = ref(false)
const vmQuote = ref('')
const vmAuthor = ref('')
const vmBg = ref('linear-gradient(160deg,#1a0d2e,#3d1a56)')
const vmFont = ref('Lora')
const vmItalic = ref(true)

const bgOptions = [
  { label: 'Đêm tím', value: 'linear-gradient(160deg,#1a0d2e,#3d1a56)' },
  { label: 'Rừng đêm', value: 'linear-gradient(160deg,#0a1a0a,#1a4020)' },
  { label: 'Hoàng hôn', value: 'linear-gradient(160deg,#1a1006,#402808)' },
  { label: 'Đại dương', value: 'linear-gradient(160deg,#001828,#003858)' },
]
const fontOptions = [
  { label: 'Lora', family: 'Lora', italic: true },
  { label: 'Playfair', family: '"Playfair Display"', italic: true },
  { label: 'Nunito', family: 'Nunito', italic: false },
]

function openVideo(quote: string) {
  vmQuote.value = quote.replace(/^["""]|["""]$/g, '')
  videoOpen.value = true
}
function exportVideo() {
  showToast('🎬 Video đang được tạo!')
  videoOpen.value = false
}

// Toast
const toastMsg = ref('')
const toastVisible = ref(false)
let toastTimer: ReturnType<typeof setTimeout> | null = null
function showToast(msg: string) {
  toastMsg.value = msg
  toastVisible.value = true
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastVisible.value = false }, 2400)
}

// Close modals on Escape
onMounted(() => {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { writeOpen.value = false; videoOpen.value = false }
  })
})
</script>
