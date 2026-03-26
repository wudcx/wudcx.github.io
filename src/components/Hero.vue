<template>
  <section id="home" class="hero">
    <div class="container">
      <div class="hero-content">
        <h1>{{ t('hero.title') }}</h1>
        <p class="subtitle">{{ t('hero.subtitle') }}</p>
        <a href="#articles" class="btn">{{ t('hero.readArticles') }}</a>
      </div>
      <div class="hero-image">
        <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" alt="编程">
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style scoped>
/* 组件特定样式 */
</style>