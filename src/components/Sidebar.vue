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
  width: 220px;
  border-right: 1px solid var(--border-color);
  height: calc(100vh - 64px);
  overflow-y: auto;
  position: sticky;
  top: 64px;
  flex-shrink: 0;
  background: var(--card-bg);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
}

.sidebar-content {
  padding: 1rem;
}

.sidebar-category {
  margin-bottom: 1rem;
}

.sidebar-category-header {
  font-weight: 600;
  font-size: 0.7rem;
  color: var(--text-color);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
  padding-top: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  user-select: none;
  border-top: 3px solid transparent;
  border-image: linear-gradient(90deg, var(--primary-color), var(--secondary-color)) 1;
}

.sidebar-category-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  border-radius: var(--radius) var(--radius) 0 0;
}

.sidebar-category-header {
  position: relative;
}

.collapse-icon {
  font-size: 0.7rem;
  color: var(--text-lighter);
}

.sidebar-article-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-article-link {
  display: block;
  padding: 0.35rem 0.5rem 0.35rem 1.1rem;
  font-size: 0.8rem;
  color: var(--text-light);
  text-decoration: none;
  border-radius: var(--radius-sm);
  border-left: 3px solid transparent;
  transition: color var(--transition-fast), background-color var(--transition-fast), border-color var(--transition-fast);
  position: relative;
}

.sidebar-article-link::before {
  content: '○';
  position: absolute;
  left: 0.4rem;
  color: var(--text-lighter);
  font-size: 0.6rem;
  transition: color var(--transition-fast);
}

.sidebar-article-link:hover {
  color: var(--text-color);
  background-color: var(--bg-secondary);
}

.sidebar-article-link.active {
  color: var(--primary-color);
  background-color: var(--bg-secondary);
  border-left-color: var(--primary-color);
  font-weight: 600;
}

.sidebar-article-link.active::before {
  content: '●';
  color: var(--primary-color);
}

/* Mobile: drawer mode */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: -280px;
    top: 0;
    height: 100vh;
    z-index: 1000;
    background: var(--card-bg);
    box-shadow: var(--shadow);
    transition: left var(--transition);
    border-radius: 0;
  }
  
  .sidebar.open {
    left: 0;
  }
  
  .sidebar-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
    opacity: 0;
    transition: opacity var(--transition);
  }
  
  .sidebar-overlay.open {
    display: block;
    opacity: 1;
  }
}
</style>