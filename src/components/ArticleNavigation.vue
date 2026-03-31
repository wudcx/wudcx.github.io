<template>
  <nav v-if="prev || next" class="article-nav">
    <router-link
      v-if="prev"
      :to="`/article/${prev.filename}`"
      class="article-nav-link prev"
    >
      <div class="nav-label">
        <i class="fas fa-arrow-left"></i> {{ t('articleDetail.previousArticle') }}
      </div>
      <div class="nav-title">{{ t(prev.title) }}</div>
    </router-link>
    <div v-else class="article-nav-placeholder"></div>

    <router-link
      v-if="next"
      :to="`/article/${next.filename}`"
      class="article-nav-link next"
    >
      <div class="nav-label">
        {{ t('articleDetail.nextArticle') }} <i class="fas fa-arrow-right"></i>
      </div>
      <div class="nav-title">{{ t(next.title) }}</div>
    </router-link>
    <div v-else class="article-nav-placeholder"></div>
  </nav>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Article } from '../articles'

defineProps<{
  prev?: Article
  next?: Article
}>()

const { t } = useI18n()
</script>

<style scoped>
.article-nav {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 3rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.article-nav-link {
  flex: 1;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  text-decoration: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  display: block;
}

.article-nav-link:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-sm);
}

.article-nav-link.prev {
  text-align: left;
}

.article-nav-link.next {
  text-align: right;
}

.nav-label {
  font-size: 0.85rem;
  color: var(--text-light);
  margin-bottom: 0.5rem;
}

.nav-label i {
  margin-right: 0.25rem;
}

.article-nav-link.next .nav-label i {
  margin-left: 0.25rem;
  margin-right: 0;
}

.nav-title {
  font-weight: 600;
  color: var(--text-color);
}

.article-nav-placeholder {
  flex: 1;
}

@media (max-width: 640px) {
  .article-nav {
    flex-direction: column;
  }

  .article-nav-link.next {
    text-align: left;
  }
}
</style>
