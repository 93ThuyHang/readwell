<template>
  <div class="dq-banner" @click="$emit('open-video', currentQ.q)">
    <div class="dqb-eyebrow">✦ Câu khích lệ hôm nay</div>
    <div class="dqb-text" :class="{ fading }">{{ currentQ.q }}</div>
    <div class="dqb-author">{{ currentQ.a }}</div>
    <div class="dqb-actions" @click.stop>
      <button class="dqb-btn primary" @click="$emit('open-video', currentQ.q)">🎬 Tạo video</button>
      <button class="dqb-btn ghost" @click="next">↻ Câu khác</button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{ 'open-video': [quote: string] }>()

const quotes = [
  { q: '"Bạn không cần phải vĩ đại để bắt đầu — nhưng phải bắt đầu để trở nên vĩ đại."', a: '— Zig Ziglar' },
  { q: '"Đọc sách là trò chuyện với những bộ óc vĩ đại nhất của nhân loại."', a: '— Descartes' },
  { q: '"Mỗi cuốn sách bạn đọc là một cuộc đời bạn sống thêm."', a: '— George R.R. Martin' },
  { q: '"Sống chậm lại — những khoảnh khắc đẹp nhất không bao giờ vội."', a: '— Eckhart Tolle' },
  { q: '"Im lặng đôi khi là câu trả lời hay nhất."', a: '— Đạt Lai Lạt Ma' },
]

const qi = ref(0)
const fading = ref(false)
const currentQ = computed(() => quotes[qi.value])

function next() {
  fading.value = true
  setTimeout(() => {
    qi.value = (qi.value + 1) % quotes.length
    fading.value = false
  }, 200)
}
</script>
