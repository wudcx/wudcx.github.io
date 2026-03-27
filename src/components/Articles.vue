<template>
  <section id="articles" class="articles">
    <div class="container">
      <h2 class="section-title">{{ t('articles.latest') }}</h2>
      <div class="articles-grid">
        <article class="card" v-for="article in articles" :key="article.id">
          <div class="card-header">
            <span class="category">{{ t(article.category) }}</span>
            <span class="date">{{ article.date }}</span>
          </div>
          <div class="card-body">
            <h3>{{ t(article.title) }}</h3>
            <p>{{ t(article.description) }}</p>
          </div>
          <div class="card-footer">
            <router-link :to="'/article/' + article.id" class="read-more">{{ t('articles.readMore') }} <i class="fas fa-arrow-right"></i></router-link>
          </div>
        </article>
      </div>
      <div class="text-center">
        <a href="#" class="btn-outline">{{ t('articles.viewMore') }}</a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { articles } from '../articles'

const { t } = useI18n()
</script>

<style scoped>
/* 组件特定样式 */
</style>
