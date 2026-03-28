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
  top: 2rem;
  max-height: calc(100vh - 4rem);
  overflow-y: auto;
  font-size: 0.85rem;
  padding-left: 1rem;
  border-left: 1px solid #e0e0e0;
}

.toc-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.75rem;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
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
  padding: 0.25rem 0;
  color: #646464;
  text-decoration: none;
  border-left: 2px solid transparent;
  margin-left: -1px;
  transition: color 0.2s, border-left-color 0.2s;
}

.toc-link:hover {
  color: var(--vp-c-brand-1, #0366d6);
  border-left-color: currentColor;
}

.toc-link.active {
  color: var(--vp-c-brand-1, #0366d6);
  border-left-color: currentColor;
  font-weight: 500;
}
</style>
