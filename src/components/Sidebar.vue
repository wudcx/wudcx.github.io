<template>
  <nav class="sidebar" :class="{ open: isOpen }">
    <div class="sidebar-overlay" v-if="isOpen" @click="closeSidebar"></div>
    <div class="sidebar-content">
      <div v-for="(articles, category) in groupedArticles" :key="category" class="sidebar-category">
        <div class="sidebar-category-header" @click="toggleCategory(category)">
          <span>{{ t(category) }}</span>
          <span class="collapse-icon">{{ collapsedCategories[category] ? '▶' : '▼' }}</span>
        </div>
        <ul v-show="!collapsedCategories[category]" class="sidebar-article-list">
          <li v-for="article in articles" :key="article.id">
            <router-link 
              :to="`/article/${article.id}`"
              class="sidebar-article-link"
              :class="{ active: article.id === currentArticleId }"
              @click="$emit('close')"
            >
              {{ t(article.title) }}
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Article } from '../articles'

const props = defineProps<{
  articles: Article[]
  currentArticleId?: number
  isOpen?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { t } = useI18n()

// Group articles by category
const groupedArticles = computed(() => {
  const groups: Record<string, Article[]> = {}
  for (const article of props.articles) {
    if (!groups[article.category]) {
      groups[article.category] = []
    }
    groups[article.category].push(article)
  }
  return groups
})

// Track collapsed state for each category
const collapsedCategories = reactive<Record<string, boolean>>({})

// Initialize all categories as expanded
for (const category in groupedArticles.value) {
  collapsedCategories[category] = false
}

function toggleCategory(category: string) {
  collapsedCategories[category] = !collapsedCategories[category]
}


</script>

<style scoped>
.sidebar {
  width: 260px;
  border-right: 1px solid #e0e0e0;
  height: calc(100vh - 64px);
  overflow-y: auto;
  position: sticky;
  top: 64px;
  flex-shrink: 0;
}

.sidebar-content {
  padding: 1.5rem;
}

.sidebar-category {
  margin-bottom: 1.5rem;
}

.sidebar-category-header {
  font-weight: 600;
  font-size: 0.9rem;
  color: #333;
  margin-bottom: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  user-select: none;
}

.collapse-icon {
  font-size: 0.7rem;
  color: #999;
}

.sidebar-article-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-article-link {
  display: block;
  padding: 0.4rem 0.75rem;
  font-size: 0.85rem;
  color: #646464;
  text-decoration: none;
  border-radius: 4px;
  border-left: 2px solid transparent;
  transition: all 0.2s;
}

.sidebar-article-link:hover {
  color: #333;
  background: #f5f5f5;
}

.sidebar-article-link.active {
  color: #0366d6;
  background: #f0f7ff;
  border-left-color: #0366d6;
}

/* Mobile: drawer mode */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: -280px;
    top: 0;
    height: 100vh;
    z-index: 1000;
    background: white;
    box-shadow: 2px 0 8px rgba(0,0,0,0.1);
    transition: left 0.3s ease;
  }
  
  .sidebar.open {
    left: 0;
  }
  
  .sidebar-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 999;
  }
  
  .sidebar-overlay.open {
    display: block;
  }
}
</style>