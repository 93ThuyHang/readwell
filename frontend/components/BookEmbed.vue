<template>
  <div class="book-card">
    <div class="bc-emoji">{{ book.emoji || '📖' }}</div>
    <div class="bc-info">
      <div class="bc-eyebrow">{{ book.status || '✦ Đã đọc xong' }}</div>
      <div class="bc-title">{{ book.bookTitle }}</div>
      <div class="bc-author">{{ book.bookAuthor }}</div>
      <div class="bc-chips">
        <span v-for="tag in book.tags" :key="tag" class="bc-chip">{{ tag }}</span>
      </div>
      <div class="bc-bar-wrap">
        <div class="bc-bar">
          <div
            class="bc-fill"
            :style="{ width: barWidth + '%', background: book.barColor || '#2e5878' }"
          ></div>
        </div>
        <div class="bc-pct" :style="{ color: book.barColor || '#2e5878' }">
          {{ barWidth === 100 ? '✓ Xong' : barWidth + '%' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  book: {
    bookTitle: string
    bookAuthor: string
    tags: string[]
    emoji?: string
    status?: string
    progress?: number
    rating?: number
    barColor?: string
  }
}>()

const barWidth = computed(() => {
  if (props.book.progress !== undefined) return props.book.progress
  // If we have a rating but no progress, assume finished reading
  return 100
})
</script>
