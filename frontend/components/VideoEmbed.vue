<template>
  <div class="video-wrap" :class="{ vplaying: isPlaying }" @click="togglePlay">
    <div class="vw-screen">
      <div class="vw-grad" :style="{ background: embed.gradient }"></div>
      <div class="vw-body">
        <div class="vw-eyebrow">{{ embed.eyebrow }}</div>
        <div class="vw-qtext" :style="{ fontSize: embed.fontSize || '21px' }">
          "{{ embed.quote }}"
        </div>
        <div class="vw-author">— {{ embed.author }}</div>
      </div>
      <div class="vw-hover">
        <div class="vw-playbig">{{ isPlaying ? '⏸' : '▶' }}</div>
      </div>
      <div class="vw-ctrl">
        <div class="vw-ctrl-row">
          <div class="vw-pb" @click.stop="togglePlay">{{ isPlaying ? '⏸' : '▶' }}</div>
          <div class="vw-prog" @click.stop="seek">
            <div class="vw-fill" :style="{ width: progress + '%' }"></div>
          </div>
          <div class="vw-time">{{ currentTime }} / 0:30</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  embed: {
    gradient: string
    quote: string
    author: string
    eyebrow: string
    fontSize?: string
  }
}>()

const isPlaying = ref(false)
const progress = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

const currentTime = computed(() => {
  const sec = Math.round(progress.value * 30 / 100)
  return `0:${sec < 10 ? '0' + sec : sec}`
})

function togglePlay() {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    timer = setInterval(() => {
      progress.value += 100 / 30
      if (progress.value >= 100) {
        progress.value = 0
        isPlaying.value = false
        if (timer) clearInterval(timer)
      }
    }, 1000)
  } else {
    if (timer) clearInterval(timer)
  }
}

function seek(e: MouseEvent) {
  const target = e.currentTarget as HTMLElement
  progress.value = (e.offsetX / target.offsetWidth) * 100
}

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
