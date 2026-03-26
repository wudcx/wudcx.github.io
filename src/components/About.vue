<template>
  <section id="about" class="about">
    <div class="container">
      <div class="about-content">
        <div class="about-text">
          <h2 class="section-title">{{ t('about.title') }}</h2>
          <p>{{ t('about.description1') }}</p>
          <p>{{ t('about.description2') }}</p>
          <div class="skills">
            <span class="skill-tag" v-for="skill in skills" :key="skill">{{ skill }}</span>
          </div>
        </div>
        <div class="about-image">
          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" alt="作者">
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const skills = [
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'Python',
  'C++'
]
</script>

<style scoped>
/* 组件特定样式 */
</style>