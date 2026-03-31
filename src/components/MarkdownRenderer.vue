<template>
  <div class="markdown-body" v-html="renderedHtml"></div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import MarkdownIt from 'markdown-it'
import markdownItContainer from 'markdown-it-container'
import { createHighlighter, type Highlighter } from 'shiki'
import plantumlEncoder from 'plantuml-encoder'

const props = defineProps<{
  source?: string
  content?: string
}>()

const highlighter = ref<Highlighter | null>(null)

const supportedLanguages = [
  'javascript',
  'typescript',
  'vue',
  'bash',
  'json',
  'python',
  'css',
  'html',
  'markdown',
  'text'
]

async function initHighlighter() {
  highlighter.value = await createHighlighter({
    themes: ['github-dark'],
    langs: supportedLanguages
  })
}

function renderCode(code: string, lang: string): string {
  if (!highlighter.value) return code
  const language = supportedLanguages.includes(lang) ? lang : 'text'
  return highlighter.value.codeToHtml(code, {
    lang: language,
    theme: 'github-dark'
  })
}

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})

md.use(markdownItContainer, 'tip', {
  render: (tokens: any[], idx: number): string => {
    if (tokens[idx].nesting === 1) {
      return `<div class="callout callout-tip">\n<div class="callout-icon">💡</div>\n<div class="callout-content">\n`
    } else {
      return `</div>\n</div>\n`
    }
  }
})

md.use(markdownItContainer, 'warning', {
  render: (tokens: any[], idx: number): string => {
    if (tokens[idx].nesting === 1) {
      return `<div class="callout callout-warning">\n<div class="callout-icon">⚠️</div>\n<div class="callout-content">\n`
    } else {
      return `</div>\n</div>\n`
    }
  }
})

md.use(markdownItContainer, 'info', {
  render: (tokens: any[], idx: number): string => {
    if (tokens[idx].nesting === 1) {
      return `<div class="callout callout-info">\n<div class="callout-icon">ℹ️</div>\n<div class="callout-content">\n`
    } else {
      return `</div>\n</div>\n`
    }
  }
})

md.use(markdownItContainer, 'danger', {
  render: (tokens: any[], idx: number): string => {
    if (tokens[idx].nesting === 1) {
      return `<div class="callout callout-danger">\n<div class="callout-icon">🚨</div>\n<div class="callout-content">\n`
    } else {
      return `</div>\n</div>\n`
    }
  }
})

// PlantUML rendering via plantuml-encoder
function renderPlantUML(code: string): string {
  const encoded = plantumlEncoder.encode(code)
  const server = 'https://www.plantuml.com/plantuml/svg/'
  return `<img src="${server}${encoded}" alt="PlantUML Diagram" class="plantuml-diagram" />`
}

md.renderer.rules.fence = (tokens: any[], idx: number, options: any, env: any, self: any): string => {
  const token = tokens[idx]
  const lang = (token.info || '').trim()

  // Handle plantuml specially
  if (lang === 'plantuml') {
    return renderPlantUML(token.content)
  }

  const code = token.content
  return renderCode(code, lang)
}

md.renderer.rules.heading_open = (tokens: any[], idx: number, options: any, env: any, self: any): string => {
  const token = tokens[idx]
  const level = parseInt(token.tag.replace('h', ''), 10)
  const nextToken = tokens[idx + 1]
  const text = nextToken?.content || ''
  const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-')
  return `<h${level} id="${id}" class="heading-anchor">`
}

const renderedHtml = computed(() => {
  const text = props.content || props.source || ''
  return md.render(text)
})

onMounted(() => {
  initHighlighter()
})
</script>

<style scoped>
@import '../assets/styles/callouts.css';

.markdown-body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  word-wrap: break-word;
  color: #24292e;
}

.markdown-body :deep(h1, h2, h3, h4, h5, h6) {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-body :deep(h1) {
  font-size: 1.75rem;
  font-weight: 700;
  border-bottom: 1px solid var(--border-color, #e1e4e8);
  padding-bottom: 0.3em;
}

.markdown-body :deep(h2) {
  font-size: 1.35rem;
  font-weight: 600;
  margin-top: 1.5em;
}

.markdown-body :deep(h3) {
  font-size: 1.1rem;
  font-weight: 600;
}

.markdown-body :deep(h4) {
  font-size: 1rem;
  font-weight: 600;
}

.markdown-body :deep(p) {
  margin-top: 0;
  margin-bottom: 16px;
  color: #24292e;
}

.markdown-body :deep(a) {
  color: #0366d6;
  text-decoration: none;
}

.markdown-body :deep(a:hover) {
  text-decoration: underline;
}

.markdown-body :deep(code) {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background-color: rgba(27,31,35,0.05);
  border-radius: 3px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
}

.markdown-body :deep(pre) {
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  border-radius: 6px;
  margin-bottom: 16px;
}

.markdown-body :deep(pre code) {
  padding: 0;
  background-color: transparent;
}

.markdown-body :deep(blockquote) {
  padding: 0 1em;
  color: #6a737d;
  border-left: 0.25em solid #dfe2e5;
  margin: 0 0 16px 0;
}

.markdown-body :deep(ul, ol) {
  padding-left: 2em;
  margin-top: 0;
  margin-bottom: 16px;
  color: #24292e;
}

/* 表格样式优化 */
.markdown-body :deep(.table-wrapper) {
  overflow-x: auto;
  margin-bottom: 16px;
  border-radius: 8px;
  border: 1px solid #e1e4e8;
}

.markdown-body :deep(table) {
  border-spacing: 0;
  border-collapse: collapse;
  width: 100%;
  margin: 0;
  font-size: 14px;
}

.markdown-body :deep(th) {
  background-color: #f6f8fa;
  font-weight: 600;
  text-align: left;
  padding: 10px 16px;
  border-bottom: 2px solid #e1e4e8;
}

.markdown-body :deep(td) {
  padding: 10px 16px;
  border-bottom: 1px solid #eaecef;
  vertical-align: top;
}

.markdown-body :deep(tr:last-child td) {
  border-bottom: none;
}

/* 斑马纹 */
.markdown-body :deep(tbody tr:nth-child(odd)) {
  background-color: #ffffff;
}

.markdown-body :deep(tbody tr:nth-child(even)) {
  background-color: #f6f8fa;
}

/* 行悬停效果 */
.markdown-body :deep(tbody tr:hover) {
  background-color: #eaecef;
}

.markdown-body :deep(img) {
  max-width: 100%;
  box-sizing: border-box;
}
</style>
