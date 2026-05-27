<template>
  <div>
    <AppHeader @open-write="writeOpen = true" />

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
          <div class="ms-fire">🔥</div>
          <div class="ms-n">{{ statsData?.recentDays ?? 7 }}</div>
          <div class="ms-t">ngày liên tiếp</div>
        </div>

        <div>
          <div class="margin-label">Quote gần đây</div>
          <div v-for="mq in miniQuotes" :key="mq.text" class="margin-quote" style="margin-bottom:16px">
            <div class="mq-mini" @click="openVideo(mq.text)">"{{ mq.text }}"</div>
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

        <div class="toc-mini-quote" @click="openVideo(miniQuotes[0].text)">
          <div class="tmq-text">"{{ miniQuotes[0].text }}"</div>
          <div class="tmq-src">{{ miniQuotes[0].src }}</div>
          <button class="tmq-vid">🎬 Tạo video từ câu này</button>
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

    <!-- WRITE MODAL -->
    <div :class="['overlay', { open: writeOpen }]" @click.self="writeOpen = false">
      <div class="modal">
        <div class="modal-hdr">
          <div class="modal-title">Viết bài mới</div>
          <button class="modal-x" @click="writeOpen = false">✕</button>
        </div>
        <div class="type-row">
          <button
            v-for="t in writeTypes"
            :key="t.id"
            :class="['type-btn', { active: writeType === t.id }]"
            @click="writeType = t.id"
          >{{ t.label }}</button>
        </div>

        <template v-if="writeType === 'note'">
          <div class="mf"><div class="ml">Tiêu đề</div><input class="mi" placeholder="Bỏ trống nếu muốn viết tự do..."></div>
          <div class="mf"><div class="ml">Bài viết</div><textarea class="mta" style="min-height:160px" placeholder="Hôm nay bạn đọc được điều gì khiến bạn dừng lại?&#10;&#10;Viết thật, viết cho chính mình..."></textarea></div>
          <div class="mf"><div class="ml">Quote đính kèm (tùy chọn)</div><textarea class="mta" style="min-height:70px;font-size:15px" placeholder="Câu trích dẫn..."></textarea></div>
        </template>

        <template v-else-if="writeType === 'quote'">
          <div class="mf"><div class="ml">Câu trích dẫn</div><textarea class="mta" style="min-height:110px" placeholder="Nhập câu quote bạn muốn giữ lại..."></textarea></div>
          <div class="mf"><div class="ml">Tác giả · Nguồn</div><input class="mi" placeholder="VD: Marcus Aurelius · Meditations"></div>
          <div class="mf"><div class="ml">Cảm nhận của bạn</div><textarea class="mta" style="min-height:80px;font-size:15px;font-style:normal;font-family:'Nunito',sans-serif" placeholder="Câu này gợi lên điều gì?"></textarea></div>
        </template>

        <template v-else-if="writeType === 'book'">
          <div class="mf"><div class="ml">Tên sách</div><input class="mi" placeholder="VD: Atomic Habits"></div>
          <div class="mf"><div class="ml">Tác giả</div><input class="mi" placeholder="VD: James Clear"></div>
          <div class="mf"><div class="ml">Cảm nhận</div><textarea class="mta" style="min-height:130px" placeholder="Điều gì trong cuốn này khiến bạn không thể ngủ được?"></textarea></div>
        </template>

        <template v-else>
          <div class="mf"><div class="ml">Quote cho video</div><textarea class="mta" style="min-height:90px" placeholder="Câu quote bạn muốn làm video..."></textarea></div>
          <div class="mf"><div class="ml">Tác giả · Nguồn</div><input class="mi" placeholder="VD: Marcus Aurelius · Meditations"></div>
          <div style="background:var(--rust-s);border-radius:11px;padding:12px 16px;font-family:'Nunito',sans-serif;font-size:13px;color:var(--rust);font-weight:700">🎬 Sau khi lưu bạn có thể chọn style và xuất video</div>
        </template>

        <div class="m-footer">
          <button class="m-cancel" @click="writeOpen = false">Hủy</button>
          <button class="m-save" @click="savePost">✦ Lưu bài viết</button>
        </div>
      </div>
    </div>

    <!-- VIDEO MODAL -->
    <div :class="['overlay', { open: videoOpen }]" @click.self="videoOpen = false">
      <div class="modal vmodal">
        <div class="modal-hdr">
          <div class="modal-title">🎬 Tạo video quote</div>
          <button class="modal-x" @click="videoOpen = false">✕</button>
        </div>
        <div class="vm-layout">
          <div class="vm-preview-col">
            <div class="vm-preview" :style="{ background: vmBg }">
              <div class="vm-prev-bg" :style="{ background: vmBg }"></div>
              <div class="vm-prev-body">
                <div class="vm-prev-ey">TRANG. BLOG</div>
                <div class="vm-prev-q" :style="{ fontFamily: vmFont, fontStyle: vmItalic ? 'italic' : 'normal' }">
                  "{{ vmQuote || 'Câu quote của bạn sẽ hiện ở đây.' }}"
                </div>
                <div class="vm-prev-a">— {{ vmAuthor || 'Tác giả' }}</div>
              </div>
            </div>
            <div class="vm-preview-note">Preview · 9:16</div>
          </div>

          <div class="vm-controls">
            <div class="mf">
              <div class="ml">Nội dung</div>
              <textarea class="mta" v-model="vmQuote" style="min-height:80px;font-size:14px" placeholder="Câu quote..."></textarea>
            </div>
            <div class="mf">
              <div class="ml">Tác giả</div>
              <input class="mi" v-model="vmAuthor" placeholder="Tác giả · Nguồn">
            </div>
            <div class="mf">
              <div class="ml">Nền video</div>
              <div class="bg-options">
                <div
                  v-for="bg in bgOptions"
                  :key="bg.value"
                  :class="['bg-opt', { active: vmBg === bg.value }]"
                  :style="{ background: bg.value }"
                  @click="vmBg = bg.value"
                >
                  <div class="bg-opt-label">{{ bg.label }}</div>
                  <div class="bg-opt-check">✓</div>
                </div>
              </div>
            </div>
            <div class="mf">
              <div class="ml">Font chữ</div>
              <div class="font-row">
                <div
                  v-for="f in fontOptions"
                  :key="f.family"
                  :class="['font-btn', { active: vmFont === f.family }]"
                  :style="{ fontFamily: f.family, fontStyle: f.italic ? 'italic' : 'normal' }"
                  @click="vmFont = f.family; vmItalic = f.italic"
                >{{ f.label }}</div>
              </div>
            </div>
            <div class="m-footer" style="padding-top:12px;margin-top:0">
              <button class="m-cancel" @click="videoOpen = false">Hủy</button>
              <button class="m-save" @click="exportVideo">⬇ Xuất video</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TOAST -->
    <div :class="['toast', { show: toastVisible }]">{{ toastMsg }}</div>
  </div>
</template>

<script setup lang="ts">
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
function savePost() {
  showToast('✦ Đã lưu bài viết!')
  writeOpen.value = false
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
