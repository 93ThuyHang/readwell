<template>
  <article class="post">
    <div class="post-kicker">{{ kicker }}</div>
    <h2 class="post-title">{{ post.title }}</h2>
    <div class="post-date">
      {{ post.date }}
      <span class="sep">·</span>
      {{ post.categories?.[0] ?? '' }}
    </div>

    <div class="post-body drop-cap">
      <p v-for="(para, i) in firstParas" :key="i" v-html="para"></p>
    </div>

    <!-- Video embed -->
    <VideoEmbed v-if="post.videoEmbed" :embed="post.videoEmbed" />

    <!-- Pull quote embed (before book) -->
    <QuoteEmbed
      v-if="post.embed && !post.bookEmbed"
      :embed="post.embed as any"
      @open-video="(q) => $emit('open-video', q)"
    />

    <!-- Book card -->
    <BookEmbed v-if="post.bookEmbed" :book="post.bookEmbed as any" />

    <!-- Pull quote after book -->
    <QuoteEmbed
      v-if="post.embed && post.bookEmbed"
      :embed="post.embed as any"
      @open-video="(q) => $emit('open-video', q)"
    />

    <div v-if="post.afterEmbed" class="post-body">
      <p v-html="post.afterEmbed"></p>
    </div>

    <div v-if="remainingParas.length" class="post-body">
      <p v-for="(para, i) in remainingParas" :key="i" v-html="para"></p>
    </div>

    <div class="post-footer">
      <div class="pf-tags">
        <span v-for="tag in post.hashtags" :key="tag" class="pf-tag">{{ tag }}</span>
      </div>
      <div class="pf-actions">
        <button :class="['pf-btn', { faved: liked }]" @click="toggleLike">
          {{ liked ? '❤ Yêu thích' : '🤍 Yêu thích' }}
        </button>
        <button
          v-if="post.videoEmbed || post.embed"
          class="pf-btn"
          @click="$emit('open-video', post.embed?.quote || post.videoEmbed?.quote || '')"
        >🎬 Tạo thêm</button>
        <button v-else class="pf-btn" @click="$emit('toast', '🔗 Đã copy link!')">↗ Chia sẻ</button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
const props = defineProps<{
  post: {
    id: number
    slug?: string
    title: string
    categories?: string[]
    date: string
    author?: string
    readTime?: string
    paragraphs: string[]
    embed?: Record<string, unknown> | null
    bookEmbed?: Record<string, unknown> | null
    videoEmbed?: Record<string, unknown> | null
    afterEmbed?: string | null
    hashtags: string[]
    likes?: number
    comments?: number
  }
}>()

defineEmits<{
  'open-video': [quote: string]
  'toast': [msg: string]
}>()

const liked = ref(false)

const kicker = computed(() => {
  const cats = props.post.categories ?? []
  if (!cats.length) return ''
  return cats.join(' · ')
})

const firstParas = computed(() => {
  const paras = props.post.paragraphs ?? []
  if (!props.post.embed && !props.post.bookEmbed && !props.post.videoEmbed) return paras
  return paras.slice(0, 2)
})

const remainingParas = computed(() => {
  const paras = props.post.paragraphs ?? []
  if (!props.post.embed && !props.post.bookEmbed && !props.post.videoEmbed) return []
  return paras.slice(2)
})

function toggleLike() {
  liked.value = !liked.value
}
</script>
