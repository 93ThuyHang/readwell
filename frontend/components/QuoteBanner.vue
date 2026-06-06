<template>
  <div class="dq-banner">
    <div class="dqb-eyebrow" style="display:inline-flex;align-items:center;gap:6px"><Sparkles :size="13" /> Câu khích lệ hôm nay</div>

    <template v-if="quotes.length">
      <div class="dqb-text" :class="{ fading }">{{ currentQ.q }}</div>
      <div class="dqb-author">{{ currentQ.a }}</div>
      <div class="dqb-actions">
        <button
          v-if="quotes.length > 1"
          class="dqb-btn ghost"
          @click="next"
          style="display:inline-flex;align-items:center;gap:6px"
        >
          <RefreshCw :size="13" /> Câu khác
        </button>
      </div>
    </template>

    <template v-else-if="pending">
      <div class="dqb-text" style="opacity:0.4">Đang tải...</div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Sparkles, RefreshCw } from 'lucide-vue-next'

type Quote = { q: string; a: string }

const FALLBACK: Quote[] = [
  { q: '"Bạn không cần phải vĩ đại để bắt đầu — nhưng phải bắt đầu để trở nên vĩ đại."', a: '— Zig Ziglar' },
  { q: '"Đọc sách là trò chuyện với những bộ óc vĩ đại nhất của nhân loại."', a: '— Descartes' },
  { q: '"Mỗi cuốn sách bạn đọc là một cuộc đời bạn sống thêm."', a: '— George R.R. Martin' },
]

const quotes = ref<Quote[]>([])
const pending = ref(true)
const qi = ref(0)
const fading = ref(false)

const currentQ = computed(() => quotes.value[qi.value] ?? FALLBACK[0])

onMounted(async () => {
  try {
    const data = await $fetch<Quote[]>('/api/featured-quote')
    const dbQuotes = data?.length ? data : []
    // Merge DB quotes với FALLBACK, bỏ trùng, luôn có đủ quotes để cycle
    const merged = [...dbQuotes]
    for (const fb of FALLBACK) {
      if (!merged.some((x) => x.q === fb.q)) merged.push(fb)
    }
    quotes.value = merged
  } catch {
    quotes.value = FALLBACK
  } finally {
    pending.value = false
  }
})

function next() {
  fading.value = true
  setTimeout(() => {
    qi.value = (qi.value + 1) % quotes.value.length
    fading.value = false
  }, 200)
}
</script>
