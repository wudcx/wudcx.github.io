<template>
  <header>
    <nav class="navbar" :class="{ scrolled: isScrolled }">
      <div class="container">
        <router-link to="/" class="logo">
          <span class="logo-icon">W</span>
          <span>wudcx</span>
        </router-link>
        <ul class="nav-menu" :class="{ active: isMenuOpen }">
          <li>
            <router-link to="/" @click="closeMenu">
              <i class="fas fa-home"></i>
              {{ t('header.home') }}
            </router-link>
          </li>
          <li>
            <router-link to="/articles" @click="closeMenu">
              <i class="fas fa-newspaper"></i>
              {{ t('header.articles') }}
            </router-link>
          </li>
          <li>
            <a href="#features" @click.prevent="scrollToSection('features')">
              <i class="fas fa-route"></i>
              {{ t('header.features') }}
            </a>
          </li>
          <li>
            <a href="#about" @click.prevent="scrollToSection('about')">
              <i class="fas fa-user"></i>
              {{ t('header.about') }}
            </a>
          </li>
          <li>
            <a href="#contact" @click.prevent="scrollToSection('contact')">
              <i class="fas fa-envelope"></i>
              {{ t('header.contact') }}
            </a>
          </li>
        </ul>
        <div class="nav-actions">
          <button class="theme-toggle" @click="toggleTheme" :title="t('common.toggleTheme')">
            <i :class="themeIcon"></i>
          </button>
          <button class="locale-toggle" @click="toggleLocale">
            {{ locale === 'zh' ? 'EN' : '中' }}
          </button>
          <button class="menu-toggle" @click="toggleMenu">
            <i :class="menuIcon"></i>
          </button>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
const router = useRouter()
const isScrolled = ref(false)
const isMenuOpen = ref(false)
const themeIcon = ref('fas fa-moon')
const menuIcon = ref('fas fa-bars')

const toggleTheme = () => {
  isScrolled.value = document.body.classList.toggle('dark-mode')
  themeIcon.value = document.body.classList.contains('dark-mode') ? 'fas fa-sun' : 'fas fa-moon'
  localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light')
}

const toggleLocale = () => {
  const newLocale = locale.value === 'zh' ? 'en' : 'zh'
  locale.value = newLocale
  localStorage.setItem('locale', newLocale)
}

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
  menuIcon.value = isMenuOpen.value ? 'fas fa-times' : 'fas fa-bars'
}

const closeMenu = () => {
  isMenuOpen.value = false
  menuIcon.value = 'fas fa-bars'
}

const scrollToSection = (sectionId: string) => {
  closeMenu()
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode')
    themeIcon.value = 'fas fa-sun'
  }

  const savedLocale = localStorage.getItem('locale')
  if (savedLocale === 'en' || savedLocale === 'zh') {
    locale.value = savedLocale
  }

  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: var(--bg-color);
  transition: all 0.3s ease;
  border-bottom: 1px solid transparent;
}

.navbar.scrolled {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom-color: var(--border-color);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

:global(.dark-mode) .navbar.scrolled {
  background: rgba(17, 24, 39, 0.95);
}

.navbar .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: var(--text-color);
  font-weight: 700;
  font-size: 1.35rem;
}

.logo-icon {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  border-radius: 10px;
  font-size: 1.1rem;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-menu li a {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  color: var(--text-color);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  border-radius: var(--radius);
  transition: all 0.2s ease;
}

.nav-menu li a:hover {
  background: var(--bg-secondary);
  color: var(--primary-color);
}

.nav-menu li a i {
  font-size: 0.9rem;
  opacity: 0.7;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.theme-toggle,
.locale-toggle,
.menu-toggle {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.85rem;
  font-weight: 600;
}

.theme-toggle:hover,
.locale-toggle:hover {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.menu-toggle {
  display: none;
}

@media (max-width: 900px) {
  .nav-menu {
    position: fixed;
    top: 73px;
    left: 0;
    right: 0;
    background: var(--bg-color);
    flex-direction: column;
    padding: 1rem;
    gap: 0.25rem;
    border-bottom: 1px solid var(--border-color);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
  }

  .nav-menu.active {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }

  .nav-menu li {
    width: 100%;
  }

  .nav-menu li a {
    justify-content: center;
    padding: 0.875rem;
  }

  .menu-toggle {
    display: flex;
  }
}
</style>
