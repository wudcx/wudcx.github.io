<template>
  <section id="features" class="features">
    <div class="container">
      <div class="features-header">
        <h2>{{ t('features.title') }}</h2>
        <p>{{ t('features.subtitle') }}</p>
      </div>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">
            <i class="fas fa-bolt"></i>
          </div>
          <h3>{{ t('features.devEfficiency.title') }}</h3>
          <p>{{ t('features.devEfficiency.description') }}</p>
          <div class="feature-tags">
            <span class="feature-tag" v-for="tag in devEfficiencyTags" :key="tag">{{ tag }}</span>
          </div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <i class="fas fa-robot"></i>
          </div>
          <h3>{{ t('features.aiProgramming.title') }}</h3>
          <p>{{ t('features.aiProgramming.description') }}</p>
          <div class="feature-tags">
            <span class="feature-tag" v-for="tag in aiProgrammingTags" :key="tag">{{ tag }}</span>
          </div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <i class="fas fa-code"></i>
          </div>
          <h3>{{ t('features.programming.title') }}</h3>
          <p>{{ t('features.programming.description') }}</p>
          <div class="feature-tags">
            <span class="feature-tag" v-for="tag in programmingTags" :key="tag">{{ tag }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

const devEfficiencyTags = computed(() => {
  return locale.value === 'zh' 
    ? ['Neovim', '终端', 'zsh', 'tmux']
    : ['Neovim', 'Terminal', 'zsh', 'tmux']
})

const aiProgrammingTags = computed(() => {
  return locale.value === 'zh'
    ? ['OpenCode', 'Copilot', 'LLM', 'Prompt']
    : ['OpenCode', 'Copilot', 'LLM', 'Prompt']
})

const programmingTags = computed(() => {
  return locale.value === 'zh'
    ? ['C++', 'Python', '系统设计', '算法']
    : ['C++', 'Python', 'System Design', 'Algorithms']
})
</script>

<style scoped>
.features {
  padding: 5rem 0;
  background: var(--bg-color);
}

.features-header {
  text-align: center;
  margin-bottom: 4rem;
}

.features-header h2 {
  font-family: 'Roboto Slab', serif;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.features-header p {
  font-size: 1.15rem;
  color: var(--text-light);
  max-width: 600px;
  margin: 0 auto;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.feature-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 2rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border-color: transparent;
}

.feature-card:hover::before {
  opacity: 1;
}

.feature-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  border-radius: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1.5rem;
}

.feature-icon i {
  font-size: 1.75rem;
  color: white;
}

.feature-card h3 {
  font-size: 1.35rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.feature-card p {
  color: var(--text-light);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.feature-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.feature-tag {
  background: var(--bg-secondary);
  color: var(--text-light);
  padding: 0.35rem 0.85rem;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.feature-card:hover .feature-tag {
  background: rgba(37, 99, 235, 0.1);
  color: var(--primary-color);
}

@media (max-width: 1024px) {
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .features {
    padding: 3rem 0;
  }

  .features-header h2 {
    font-size: 2rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .feature-card {
    padding: 1.5rem;
  }
}
</style>
