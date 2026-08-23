<template>
  <div class="pull-quote" :style="embed.borderColor ? { borderColor: embed.borderColor, background: embed.bg || 'var(--rust-s)' } : {}">
    <div class="pq-text">"{{ embed.quote }}"</div>
    <div v-if="embed.attribution || embed.source" class="pq-source">
      <template v-if="embed.attribution">— {{ embed.attribution }}</template><span v-if="embed.source">{{ embed.attribution ? ' · ' : '' }}{{ embed.source }}</span>
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
