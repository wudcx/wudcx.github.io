<template>
  <div class="articles-page">
    <section class="articles-hero">
      <div class="container">
        <h1>{{ t('articles.title') }}</h1>
        <p>{{ t('articles.subtitle') }}</p>
      </div>
    </section>
    <section class="articles-list">
      <div class="container">
        <div class="articles-grid-full">
          <article class="article-card-full" v-for="article in articles" :key="article.filename">
            <div class="article-card-inner">
              <div class="article-info">
                <span class="article-category">
                  <i :class="getCategoryIcon(article.category)"></i>
                  {{ t(getCategoryLabel(article.category)) }}
                </span>
                <span class="article-date">{{ article.date }}</span>
                <span class="read-time">
                  <i class="fas fa-clock"></i>
                  8 {{ t('articles.readTime') }}
                </span>
              </div>
              <h2>{{ t(article.title) }}</h2>
              <p>{{ t(article.description) }}</p>
              <router-link :to="'/article/' + article.filename" class="read-more">
                {{ t('articles.readMore') }}
                <i class="fas fa-arrow-right"></i>
              </router-link>
            </div>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { articles, articleTree } from '../articles'

const { t } = useI18n()

const getCategoryIcon = (category: string[]): string => {
  const topKey = category[0]
  return articleTree[topKey]?.icon || 'fas fa-file-lines'
}

const getCategoryLabel = (category: string[]): string => {
  const topKey = category[0]
  return articleTree[topKey]?.label || topKey
}
</script>

<style scoped>
.articles-hero {
  padding: 80px 0 48px;
  background: var(--bg-secondary);
  text-align: center;
}

.articles-hero h1 {
  font-size: clamp(2rem, 4vw, 3rem);
  margin-bottom: 16px;
}

.articles-hero p {
  font-size: 1.125rem;
  color: var(--text-light);
}

.articles-list {
  padding: 64px 0;
}

.articles-grid-full {
  display: grid;
  gap: 24px;
  max-width: 900px;
  margin: 0 auto;
}

.article-card-full {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 32px;
  transition: var(--transition);
}

.article-card-full:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.article-card-inner {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.article-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.article-category {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.article-date {
  color: var(--text-lighter);
  font-size: 0.875rem;
}

.read-time {
  color: var(--text-lighter);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 6px;
}

.article-card-full h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
}

.article-card-full p {
  font-size: 1rem;
  line-height: 1.7;
}

.read-more {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--primary-color);
  font-weight: 600;
  transition: var(--transition-fast);
}

.read-more:hover {
  color: var(--primary-dark);
  gap: 12px;
}

@media (max-width: 768px) {
  .articles-hero {
    padding: 48px 0 32px;
  }
  
  .article-card-full {
    padding: 24px;
  }
  
  .article-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
