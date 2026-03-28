<template>
  <section id="about" class="about">
    <div class="container">
      <div class="about-image-wrapper">
        <div class="about-image-container">
          <img 
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" 
            alt="Author" 
            class="about-image"
          />
        </div>
        <div class="about-decoration"></div>
      </div>
      <div class="about-content">
        <h2>{{ t('about.title') }}</h2>
        <p class="about-intro">{{ t('about.intro') }}</p>
        <div class="about-highlights">
          <div class="about-highlight">
            <div class="about-highlight-icon">
              <i class="fas fa-pen"></i>
            </div>
            <div class="about-highlight-text">
              <h4>{{ t('about.highlights.writing.label') }}</h4>
              <p>{{ t('about.highlights.writing.desc') }}</p>
            </div>
          </div>
          <div class="about-highlight">
            <div class="about-highlight-icon">
              <i class="fas fa-code-branch"></i>
            </div>
            <div class="about-highlight-text">
              <h4>{{ t('about.highlights.coding.label') }}</h4>
              <p>{{ t('about.highlights.coding.desc') }}</p>
            </div>
          </div>
          <div class="about-highlight">
            <div class="about-highlight-icon">
              <i class="fas fa-graduation-cap"></i>
            </div>
            <div class="about-highlight-text">
              <h4>{{ t('about.highlights.teaching.label') }}</h4>
              <p>{{ t('about.highlights.teaching.desc') }}</p>
            </div>
          </div>
        </div>
        <div class="skills-section">
          <h3>{{ t('about.skills') }}</h3>
          <div class="skills">
            <span class="skill-tag" v-for="skill in skills" :key="skill">{{ skill }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const skills = [
  'TypeScript',
  'Vue.js',
  'React',
  'Node.js',
  'Python',
  'C++',
  'Neovim',
  'Linux',
  'Git'
]
</script>

<style scoped>
.about {
  padding: 5rem 0;
  background: var(--bg-color);
}

.about .container {
  display: grid;
  grid-template-columns: 0.8fr 1.2fr;
  gap: 5rem;
  align-items: center;
}

.about-image-wrapper {
  position: relative;
}

.about-image-container {
  position: relative;
  z-index: 1;
}

.about-image {
  width: 100%;
  border-radius: 24px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
}

.about-decoration {
  position: absolute;
  top: 20px;
  right: -20px;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  border-radius: 24px;
  z-index: 0;
  opacity: 0.2;
}

.about-content h2 {
  font-family: 'Roboto Slab', serif;
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.about-intro {
  color: var(--text-light);
  font-size: 1.1rem;
  line-height: 1.7;
  margin-bottom: 2.5rem;
}

.about-highlights {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.about-highlight {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.about-highlight-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.about-highlight-icon i {
  color: white;
  font-size: 1.2rem;
}

.about-highlight-text h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.about-highlight-text p {
  color: var(--text-light);
  font-size: 0.85rem;
}

.skills-section h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.skills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.skill-tag {
  background: var(--bg-secondary);
  color: var(--text-color);
  padding: 0.5rem 1.25rem;
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 500;
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

.skill-tag:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

@media (max-width: 1024px) {
  .about .container {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .about-image-wrapper {
    max-width: 400px;
    margin: 0 auto;
  }

  .about-highlights {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 640px) {
  .about {
    padding: 3rem 0;
  }

  .about-highlights {
    grid-template-columns: 1fr;
  }
}
</style>
