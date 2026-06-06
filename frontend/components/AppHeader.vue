<template>
  <header class="site-header">
    <div class="hdr-inner">
      <div class="hdr-logo">Readwell<em>.</em></div>
      <nav class="hdr-nav">
        <a
          v-for="item in navItems"
          :key="item"
          :class="['hdr-nav-link', { active: activeNav === item }]"
          @click="activeNav = item"
        >{{ item }}</a>
      </nav>
      <div class="hdr-right">
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
defineEmits(['open-write'])

const navItems = ['Tất cả', 'Tự sự', 'Quote', 'Video', 'Sách']
const activeNav = ref('Tất cả')
</script>
