<template>
  <nav class="sidebar" :class="{ open: isOpen }">
    <div class="sidebar-overlay" v-if="isOpen" @click="$emit('close')"></div>
    <div class="sidebar-content">
      <div v-for="(group, topKey) in articleTree" :key="topKey" class="sidebar-category">
        <div class="sidebar-category-header" @click="toggle(topKey)">
          <i :class="group.icon"></i>
          <span>{{ t(group.label) }}</span>
          <span class="sidebar-collapse-icon">{{ collapsed[topKey] ? '▶' : '▼' }}</span>
        </div>
        <ul v-show="!collapsed[topKey]" class="sidebar-article-list">
          <template v-for="item in group.items" :key="item.key || (item as Article).id">
            <li v-if="isArticle(item)">
              <router-link 
                :to="`/article/${item.filename}`"
                class="sidebar-article-link"
                :class="{ active: item.filename === currentArticleFilename }"
                @click="$emit('close')"
              >
                {{ t(item.title) }}
              </router-link>
            </li>
            <template v-else>
              <li v-for="subItem in item.items" :key="(subItem as Article).id">
                <router-link 
                  :to="`/article/${(subItem as Article).filename}`"
                  class="sidebar-article-link"
                  :class="{ active: (subItem as Article).filename === currentArticleFilename }"
                  @click="$emit('close')"
                >
                  {{ t((subItem as Article).title) }}
                </router-link>
              </li>
            </template>
          </template>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { articleTree as articleTreeData, type Article, type ArticleGroup } from '../articles'

const props = defineProps<{
  currentArticleFilename?: string
  isOpen?: boolean
}>()

defineEmits<{ (e: 'close'): void }>()

const { t } = useI18n()

const articleTree = articleTreeData

const topLevelKeys = computed(() => Object.keys(articleTree))

const collapsed = reactive<Record<string, boolean>>({})
for (const key of topLevelKeys.value) {
  collapsed[key] = false
}

function toggle(key: string) {
  collapsed[key] = !collapsed[key]
}

function isArticle(item: Article | ArticleGroup): item is Article {
  return 'filename' in item
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
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
  padding-top: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  user-select: none;
}

.sidebar-category-header i {
  font-size: 0.75rem;
}

.sidebar-collapse-icon {
  margin-left: auto;
  font-size: 0.6rem;
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