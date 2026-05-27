<template>
  <div class="pull-quote" :style="embed.borderColor ? { borderColor: embed.borderColor, background: embed.bg || 'var(--rust-s)' } : {}">
    <div class="pq-text">"{{ embed.quote }}"</div>
    <div class="pq-source">
      — {{ embed.attribution }}<span v-if="embed.source"> · {{ embed.source }}</span>
      <button class="pq-vid" @click="$emit('open-video', embed.quote)">🎬 Tạo video</button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{ 'open-video': [quote: string] }>()
defineProps<{
  embed: {
    quote: string
    attribution: string
    source?: string
    borderColor?: string
    bg?: string
  }
}>()
</script>
