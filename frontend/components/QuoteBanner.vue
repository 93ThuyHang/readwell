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

    <template v-else>
      <div class="dqb-text" style="opacity:0.4">Chưa có câu khích lệ nào.</div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Sparkles, RefreshCw } from 'lucide-vue-next'

type Quote = { q: string; a: string }

const quotes = ref<Quote[]>([])
const pending = ref(true)
const qi = ref(0)
const fading = ref(false)

const currentQ = computed(() => quotes.value[qi.value] ?? { q: '', a: '' })

onMounted(async () => {
  try {
    // Chỉ lấy quote từ DB, không dùng dữ liệu hardcode
    const data = await $fetch<Quote[]>('/api/featured-quote')
    quotes.value = data?.length ? data : []
  } catch {
    quotes.value = []
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
