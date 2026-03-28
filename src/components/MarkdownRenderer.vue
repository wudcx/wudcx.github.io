<template>
  <div class="markdown-body" v-html="renderedHtml"></div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import MarkdownIt from 'markdown-it'
import markdownItContainer from 'markdown-it-container'
import { createHighlighter, type Highlighter } from 'shiki'

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

md.renderer.rules.fence = (tokens: any[], idx: number, options: any, env: any, self: any): string => {
  const token = tokens[idx]
  const lang = token.info.trim() || 'text'
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
}

.markdown-body :deep(h1, h2, h3, h4, h5, h6) {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-body :deep(p) {
  margin-top: 0;
  margin-bottom: 16px;
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
}

.markdown-body :deep(table) {
  border-spacing: 0;
  border-collapse: collapse;
  margin-top: 0;
  margin-bottom: 16px;
}

.markdown-body :deep(th, td) {
  padding: 6px 13px;
  border: 1px solid #dfe2e5;
}

.markdown-body :deep(img) {
  max-width: 100%;
  box-sizing: border-box;
}
</style>
