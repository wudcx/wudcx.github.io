<template>
  <div class="article-detail">
    <!-- Mobile sidebar toggle button -->
    <button class="sidebar-toggle" @click="sidebarOpen = true">
      ☰ 文章目录
    </button>

    <div class="container">
      <div class="back-link">
        <router-link to="/" class="btn-back">
          <i class="fas fa-arrow-left"></i> {{ t('articleDetail.backToHome') }}
        </router-link>
      </div>

      <div v-if="loading" class="loading">
        {{ t('articleDetail.loading') }}
      </div>

      <div v-else-if="error" class="error">
        {{ error }}
      </div>

      <div v-else class="article-layout">
        <Sidebar
          :articles="articles"
          :current-article-id="article?.id"
          :is-open="sidebarOpen"
          @close="sidebarOpen = false"
        />

        <div class="article-main">
          <header class="article-header">
            <h1 class="article-title">{{ t(article?.title ?? '') }}</h1>
            <div class="article-meta">
              <span class="category">{{ t(article?.category ?? '') }}</span>
              <span class="date">{{ article?.date }}</span>
            </div>
          </header>

          <div class="toc-mobile">
            <TableOfContents :content="markdownContent" />
          </div>

          <MarkdownRenderer :content="markdownContent" />

          <ArticleNavigation :prev="prevArticle" :next="nextArticle" />
        </div>

        <aside class="article-toc">
          <TableOfContents :content="markdownContent" />
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import MarkdownRenderer from '../components/MarkdownRenderer.vue'
import TableOfContents from '../components/TableOfContents.vue'
import ArticleNavigation from '../components/ArticleNavigation.vue'
import Sidebar from '../components/Sidebar.vue'
import { articles, type Article } from '../articles'

const { t, locale } = useI18n()
const route = useRoute()
const loading = ref(true)
const sidebarOpen = ref(false)
const error = ref('')
const article = ref<Article | null>(null)
const markdownContent = ref('')

const currentIndex = computed(() => {
  if (!article.value) return -1
  return articles.findIndex(a => a.id === article.value?.id)
})

const prevArticle = computed(() => {
  const idx = currentIndex.value
  if (idx <= 0) return undefined
  return articles[idx - 1]
})

const nextArticle = computed(() => {
  const idx = currentIndex.value
  if (idx < 0 || idx >= articles.length - 1) return undefined
  return articles[idx + 1]
})

const loadArticle = async () => {
  loading.value = true
  error.value = ''

  try {
    const articleId = parseInt(route.params.id as string)
    const foundArticle = articles.find(a => a.id === articleId)

    if (!foundArticle) {
      error.value = t('articleDetail.articleNotFound')
      return
    }

    article.value = foundArticle

    // Load markdown file based on current locale
    const response = await fetch(`/articles/${locale.value}/${foundArticle.filename}.md`)
    if (!response.ok) {
      throw new Error(`Failed to load: ${response.status}`)
    }

    markdownContent.value = await response.text()
  } catch (err) {
    error.value = err instanceof Error ? err.message : t('articleDetail.loadError')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadArticle()
})

watch(() => route.params.id, () => {
  loadArticle()
})
</script>

<style scoped>
.article-detail {
  padding: 2rem 0;
}

.sidebar-toggle {
  display: none;
  position: fixed;
  bottom: 2rem;
  left: 1rem;
  z-index: 998;
  padding: 0.75rem 1rem;
  background: #0366d6;
  color: white;
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  cursor: pointer;
  font-size: 0.9rem;
}

.sidebar-toggle:hover {
  background: #0256b9;
}

.back-link {
  margin-bottom: 2rem;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f5f5f5;
  border-radius: 4px;
  color: #333;
  text-decoration: none;
  transition: background 0.2s;
}

.btn-back:hover {
  background: #e0e0e0;
}

.article-layout {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.article-main {
  flex: 1;
  min-width: 0;
  max-width: 800px;
}

.article-toc {
  width: 200px;
  flex-shrink: 0;
}

.toc-mobile {
  display: none;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

@media (max-width: 1024px) {
  .sidebar-toggle {
    display: block;
  }

  .article-layout {
    flex-direction: column;
  }

  .article-toc {
    display: none;
  }

  .toc-mobile {
    display: block;
  }
}

.article-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.article-title {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.article-meta {
  display: flex;
  gap: 1rem;
  color: #666;
  font-size: 0.9rem;
}

.category {
  background: #e0e0e0;
  padding: 0.2rem 0.5rem;
  border-radius: 3px;
}

.loading, .error {
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
}

.error {
  color: #d32f2f;
}

</style>
