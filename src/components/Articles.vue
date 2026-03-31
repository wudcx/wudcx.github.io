<template>
  <section id="articles" class="articles">
    <div class="container">
      <div class="articles-header">
        <div>
          <h2>{{ t('articles.title') }}</h2>
          <p>{{ t('articles.subtitle') }}</p>
        </div>
      </div>
      <div class="articles-grid">
        <article class="article-card" v-for="article in articles" :key="article.filename">
          <div class="article-card-header">
            <span class="article-category">
              <i :class="getCategoryIcon(article.category)"></i>
              {{ t(getCategoryLabel(article.category)) }}
            </span>
            <span class="article-date">{{ article.date }}</span>
          </div>
          <div class="article-card-body">
            <h3>{{ t(article.title) }}</h3>
            <p>{{ t(article.description) }}</p>
          </div>
          <div class="article-card-footer">
            <span class="read-time">
              <i class="fas fa-clock"></i>
              8 {{ t('articles.readTime') }}
            </span>
            <router-link :to="'/article/' + article.filename" class="read-more">
              {{ t('articles.readMore') }}
              <i class="fas fa-arrow-right"></i>
            </router-link>
          </div>
        </article>
      </div>
      <div class="text-center">
        <router-link to="/articles" class="view-all-link">
          {{ t('articles.viewMore') }}
          <i class="fas fa-arrow-right"></i>
        </router-link>
      </div>
    </div>
  </section>
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
.articles {
  padding: 5rem 0;
  background: var(--bg-secondary);
}

.articles-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 3rem;
}

.articles-header h2 {
  font-family: 'Roboto Slab', serif;
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.articles-header p {
  color: var(--text-light);
  font-size: 1.05rem;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-bottom: 3rem;
}

.article-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.article-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.1);
}

.article-card-header {
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
}

.article-category {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  padding: 0.35rem 1rem;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 500;
}

.article-category i {
  font-size: 0.75rem;
}

.article-date {
  color: var(--text-light);
  font-size: 0.85rem;
}

.article-card-body {
  padding: 1.5rem;
  flex: 1;
}

.article-card-body h3 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.article-card-body p {
  color: var(--text-light);
  font-size: 0.95rem;
  line-height: 1.6;
}

.article-card-footer {
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.read-time {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--text-light);
  font-size: 0.85rem;
}

.read-more {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary-color);
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
  transition: all 0.2s ease;
}

.read-more:hover {
  color: var(--secondary-color);
  gap: 0.75rem;
}

.view-all-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-color);
  font-weight: 600;
  text-decoration: none;
  padding: 0.875rem 2rem;
  border: 2px solid var(--border-color);
  border-radius: var(--radius);
  transition: all 0.3s ease;
}

.view-all-link:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

@media (max-width: 1024px) {
  .articles-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .articles {
    padding: 3rem 0;
  }

  .articles-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .articles-grid {
    grid-template-columns: 1fr;
  }
}
</style>
