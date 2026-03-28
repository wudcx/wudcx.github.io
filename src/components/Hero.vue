<template>
  <section id="home" class="hero">
    <div class="container">
      <div class="hero-content">
        <span class="hero-badge">
          <i class="fas fa-rocket"></i>
          {{ t('hero.badge') }}
        </span>
        <h1>
          {{ t('hero.title') }}
          <span class="highlight">{{ t('hero.titleHighlight') }}</span>
        </h1>
        <p class="hero-description">{{ t('hero.subtitle') }}</p>
        <div class="hero-actions">
          <router-link to="/articles" class="btn btn-primary">
            <i class="fas fa-play"></i>
            {{ t('hero.cta') }}
          </router-link>
          <a href="#features" class="btn btn-secondary" @click.prevent="scrollToSection('features')">
            {{ t('hero.ctaSecondary') }}
          </a>
        </div>
        <div class="hero-stats">
          <div class="hero-stat">
            <div class="hero-stat-value">10+</div>
            <div class="hero-stat-label">{{ t('hero.stats.articles') }}</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-value">3</div>
            <div class="hero-stat-label">{{ t('hero.stats.topics') }}</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-value">1K+</div>
            <div class="hero-stat-label">{{ t('hero.stats.readers') }}</div>
          </div>
        </div>
      </div>
      <div class="hero-visual">
        <div class="orb-container">
          <div class="orb orb-1"></div>
          <div class="orb orb-2"></div>
          <div class="orb orb-3"></div>
          <div class="orb-core">
            <i class="fas fa-code"></i>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<style scoped>
.hero {
  padding: 5rem 0 4rem;
  background: var(--bg-secondary);
  min-height: 85vh;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 70%;
  height: 150%;
  background: radial-gradient(ellipse, rgba(37, 99, 235, 0.08) 0%, transparent 70%);
  pointer-events: none;
}

.hero .container {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 3rem;
  align-items: center;
  position: relative;
  z-index: 1;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
}

.hero h1 {
  font-family: 'Roboto Slab', serif;
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.15;
  margin-bottom: 1.5rem;
}

.highlight {
  display: block;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-size: 1.2rem;
  color: var(--text-light);
  line-height: 1.7;
  margin-bottom: 2rem;
  max-width: 540px;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.75rem;
  border-radius: var(--radius);
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: var(--secondary-color);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
}

.btn-secondary {
  background: transparent;
  color: var(--text-color);
  border: 2px solid var(--border-color);
}

.btn-secondary:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.hero-stats {
  display: flex;
  gap: 2.5rem;
}

.hero-stat {
  text-align: left;
}

.hero-stat-value {
  font-family: 'Roboto Slab', serif;
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1;
}

.hero-stat-label {
  color: var(--text-light);
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.hero-visual {
  display: flex;
  justify-content: center;
  align-items: center;
}

.orb-container {
  position: relative;
  width: 360px;
  height: 360px;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.6;
}

.orb-1 {
  width: 280px;
  height: 280px;
  top: 40px;
  left: 40px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  animation: float1 6s ease-in-out infinite;
}

.orb-2 {
  width: 200px;
  height: 200px;
  top: 100px;
  left: 120px;
  background: linear-gradient(135deg, var(--secondary-color), var(--accent-color));
  animation: float2 8s ease-in-out infinite;
}

.orb-3 {
  width: 160px;
  height: 160px;
  top: 140px;
  left: 80px;
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  animation: float3 7s ease-in-out infinite;
  opacity: 0.4;
}

.orb-core {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  background: var(--bg-secondary);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  z-index: 1;
}

.orb-core i {
  font-size: 3rem;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@keyframes float1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(15px, -20px) scale(1.05); }
}

@keyframes float2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-20px, 15px) scale(1.08); }
}

@keyframes float3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(10px, 20px) scale(0.95); }
}

@media (max-width: 1024px) {
  .hero .container {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .hero h1 {
    font-size: 2.75rem;
  }

  .hero-description {
    margin: 0 auto 2rem;
  }

  .hero-actions {
    justify-content: center;
  }

  .hero-stats {
    justify-content: center;
  }

  .orb-container {
    width: 280px;
    height: 280px;
  }

  .orb-1 { width: 220px; height: 220px; top: 30px; left: 30px; }
  .orb-2 { width: 160px; height: 160px; top: 80px; left: 90px; }
  .orb-3 { width: 130px; height: 130px; top: 110px; left: 60px; }
  .orb-core { width: 90px; height: 90px; }
  .orb-core i { font-size: 2.25rem; }
}

@media (max-width: 640px) {
  .hero {
    padding: 4rem 0 3rem;
    min-height: auto;
  }

  .hero h1 {
    font-size: 2rem;
  }

  .hero-actions {
    flex-direction: column;
  }

  .btn {
    justify-content: center;
  }

  .hero-stats {
    flex-wrap: wrap;
    gap: 1.5rem;
  }
}
</style>
