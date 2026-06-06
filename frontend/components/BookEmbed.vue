<template>
  <div class="book-card">
    <div class="bc-emoji">
      <span v-if="book.emoji">{{ book.emoji }}</span>
      <BookOpen v-else :size="22" />
    </div>
    <div class="bc-info">
      <div class="bc-eyebrow flex items-center gap-1"><Check :size="12" /> {{ book.status || 'Đã đọc xong' }}</div>
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
          <template v-if="barWidth === 100"><Check :size="12" /> Xong</template>
          <template v-else>{{ barWidth }}%</template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BookOpen, Check } from 'lucide-vue-next'

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
