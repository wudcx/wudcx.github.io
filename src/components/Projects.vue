<template>
  <section id="projects" class="projects">
    <div class="container">
      <h2 class="section-title">{{ t('projects.title') }}</h2>
      <div class="projects-grid">
        <div class="project-card" v-for="project in projects" :key="project.id">
          <div class="project-icon">
            <i :class="project.icon"></i>
          </div>
          <h3>{{ project.title }}</h3>
          <p>{{ project.description }}</p>
          <a href="#" class="project-link">{{ t('projects.viewProject') }} <i class="fas fa-external-link-alt"></i></a>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Project {
  id: number
  icon: string
  title: string
  description: string
}

const projects: Project[] = [
  {
    id: 1,
    icon: 'fas fa-robot',
    title: 'AI编程助手工具',
    description: '基于AI API开发的VS Code扩展，提供智能代码补全和重构建议。'
  },
  {
    id: 2,
    icon: 'fas fa-chart-line',
    title: '数据可视化平台',
    description: '使用D3.js和React构建的交互式数据可视化仪表板，支持实时数据更新。'
  },
  {
    id: 3,
    icon: 'fas fa-server',
    title: '微服务架构实践',
    description: '基于Kubernetes和Docker的微服务示例项目，包含完整的CI/CD流水线。'
  }
]
</script>

<style scoped>
/* 组件特定样式 */
</style>