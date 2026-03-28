<template>
  <section id="about" class="about">
    <div class="container">
      <div class="about-image-wrapper">
        <svg class="about-image" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <!-- Background -->
          <rect width="200" height="200" rx="24" fill="#f8fafc"/>
          
          <!-- Body -->
          <ellipse cx="100" cy="170" rx="50" ry="25" fill="#1f2937"/>
          
          <!-- Head -->
          <circle cx="100" cy="95" r="50" fill="#fcd34d"/>
          
          <!-- Hair -->
          <path d="M55 80 Q60 50 100 45 Q140 50 145 80 Q145 70 130 65 Q100 55 70 65 Q55 70 55 80" fill="#1f2937"/>
          
          <!-- Face features -->
          <ellipse cx="80" cy="90" rx="12" ry="14" fill="white"/>
          <ellipse cx="120" cy="90" rx="12" ry="14" fill="white"/>
          <circle cx="82" cy="92" r="6" fill="#1f2937"/>
          <circle cx="122" cy="92" r="6" fill="#1f2937"/>
          
          <!-- Glasses -->
          <rect x="65" y="82" width="30" height="22" rx="4" fill="none" stroke="#1f2937" stroke-width="3"/>
          <rect x="105" y="82" width="30" height="22" rx="4" fill="none" stroke="#1f2937" stroke-width="3"/>
          <line x1="95" y1="93" x2="105" y2="93" stroke="#1f2937" stroke-width="3"/>
          
          <!-- Ears -->
          <ellipse cx="50" cy="95" rx="8" ry="12" fill="#fcd34d"/>
          <ellipse cx="150" cy="95" rx="8" ry="12" fill="#fcd34d"/>
          
          <!-- Mouth (smile) -->
          <path d="M85 115 Q100 125 115 115" fill="none" stroke="#1f2937" stroke-width="3" stroke-linecap="round"/>
          
          <!-- Laptop indication -->
          <rect x="70" y="150" width="60" height="8" rx="2" fill="#6b7280"/>
        </svg>
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
  grid-template-columns: 260px 1fr;
  gap: 3rem;
  align-items: start;
}

.about-image-wrapper {
  position: sticky;
  top: 100px;
}

.about-image {
  width: 100%;
  border-radius: var(--radius-lg);
  display: block;
}

.about-content h2 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
}

.about-intro {
  color: var(--text-light);
  font-size: 1.05rem;
  line-height: 1.8;
  margin-bottom: 2.5rem;
}

.about-highlights {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 2.5rem;
}

.about-highlight {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.about-highlight-icon {
  width: 40px;
  height: 40px;
  min-width: 40px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.about-highlight-icon i {
  color: white;
  font-size: 1rem;
}

.about-highlight-text h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.2rem;
  color: var(--text-color);
}

.about-highlight-text p {
  color: var(--text-light);
  font-size: 0.875rem;
  margin: 0;
}

.skills-section h3 {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--text-color);
}

.skills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.skill-tag {
  background: var(--bg-secondary);
  color: var(--text-color);
  padding: 0.35rem 0.85rem;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

.skill-tag:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

@media (max-width: 768px) {
  .about .container {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .about-image-wrapper {
    position: static;
    max-width: 160px;
    margin: 0 auto;
  }

  .about-image {
    border-radius: 50%;
  }

  .about-content {
    text-align: center;
  }

  .about-highlight {
    justify-content: center;
  }
}
</style>
