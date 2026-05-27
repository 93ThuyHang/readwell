<template>
  <div class="blog-hero">
    <div class="hero-eyebrow">Nhật ký đọc sách cá nhân</div>
    <h1 class="hero-name">
      Những trang sách<br>
      làm <em>mình dừng lại.</em>
    </h1>
    <p class="hero-bio">Mình không viết để dạy ai. Mình viết vì đọc xong mà không ghi lại thì như chưa đọc — những câu chữ cứ trôi đi mất.</p>
    <div class="hero-meta">
      <div class="hm-stat"><strong>{{ data?.books ?? 31 }}</strong> cuốn sách</div>
      <div class="hm-stat" style="color:var(--b1)">·</div>
      <div class="hm-stat"><strong>{{ data?.reviews ?? 47 }}</strong> câu quote</div>
      <div class="hm-stat" style="color:var(--b1)">·</div>
      <div class="hm-stat"><strong>{{ data?.videos ?? 12 }}</strong> video</div>
      <div class="hm-stat" style="color:var(--b1)">·</div>
      <div class="hm-stat">🔥 <strong>{{ data?.recentDays ?? 7 }}</strong> ngày liên tiếp</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  data?: { books: number; reviews: number; videos: number; recentDays: number } | null
}>()
</script>
