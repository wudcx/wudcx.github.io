<template>
  <nav v-if="headings.length > 0" class="toc">
    <div class="toc-title">{{ t('articleDetail.onThisPage') }}</div>
    <ul class="toc-list">
      <li
        v-for="heading in headings"
        :key="heading.id"
        :class="['toc-item', `toc-level-${heading.level}`]"
      >
        <a
          :href="`#${heading.id}`"
          :class="['toc-link', { active: activeId === heading.id }]"
          @click.prevent="scrollToHeading(heading.id)"
        >
          {{ heading.text }}
        </a>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'

interface Heading {
  id: string
  text: string
  level: number
}

const props = defineProps<{
  content?: string
}>()

const { t } = useI18n()
const headings = ref<Heading[]>([])
const activeId = ref<string>('')

let observer: IntersectionObserver | null = null

function extractHeadings(markdown: string): Heading[] {
  const headingRegex = /^(#{1,3})\s+(.+)$/gm
  const result: Heading[] = []
  let match

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    result.push({ id, text, level })
  }

  return result
}

function scrollToHeading(id: string): void {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    activeId.value = id
  }
}

function setupObserver(): void {
  if (observer) {
    observer.disconnect()
  }

  const headingElements = document.querySelectorAll('.markdown-body h1, .markdown-body h2, .markdown-body h3')

  if (headingElements.length === 0) return

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeId.value = entry.target.id
        }
      }
    },
    {
      rootMargin: '-80px 0px -80% 0px',
      threshold: 0
    }
  )

  headingElements.forEach((el) => {
    observer?.observe(el)
  })
}

watch(() => props.content, (newContent) => {
  if (newContent) {
    headings.value = extractHeadings(newContent)
    setTimeout(setupObserver, 100)
  }
}, { immediate: true })

onMounted(() => {
  setTimeout(setupObserver, 100)
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>

<style scoped>
.toc {
  position: sticky;
  top: 88px;
  max-height: calc(100vh - 88px - 2rem);
  overflow-y: auto;
  font-size: 0.85rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius);
  border-left: 1px solid var(--border-color);
}

.toc-title {
  font-weight: 600;
  color: var(--text-lighter);
  margin-bottom: 0.75rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-item {
  margin: 0;
}

.toc-level-2 {
  padding-left: 0;
}

.toc-level-3 {
  padding-left: 1rem;
}

.toc-link {
  display: block;
  padding: 0.3rem 0.5rem;
  color: var(--text-light);
  text-decoration: none;
  border-left: 2px solid transparent;
  margin-left: -1rem;
  padding-right: 0;
  transition: color 0.2s ease, border-left-color 0.2s ease, background-color 0.2s ease;
  border-radius: 0 var(--radius) var(--radius) 0;
}

.toc-link:hover {
  color: var(--primary-color);
  border-left-color: var(--primary-light);
}

.toc-link.active {
  color: var(--primary-color);
  font-weight: 500;
  border-left: 3px solid var(--primary-color);
  background: var(--primary-light);
  border-radius: 0 var(--radius) var(--radius) 0;
}
</style>
