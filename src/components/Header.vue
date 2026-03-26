<template>
  <header>
    <nav class="navbar">
      <div class="container">
        <router-link to="/" class="logo" @click="handleNavClick('/')">wudcx</router-link>
        <ul class="nav-menu">
          <li><a href="#home" @click.prevent="scrollToSection('home')"><i class="fas fa-home"></i> {{ t('header.home') }}</a></li>
          <li><a href="#articles" @click.prevent="scrollToSection('articles')"><i class="fas fa-newspaper"></i> {{ t('header.articles') }}</a></li>
          <li><a href="#about" @click.prevent="scrollToSection('about')"><i class="fas fa-user"></i> {{ t('header.about') }}</a></li>
          <li><a href="#projects" @click.prevent="scrollToSection('projects')"><i class="fas fa-code"></i> {{ t('header.projects') }}</a></li>
          <li><a href="#contact" @click.prevent="scrollToSection('contact')"><i class="fas fa-envelope"></i> {{ t('header.contact') }}</a></li>
        </ul>
        <div class="theme-toggle" @click="toggleTheme">
          <i :class="themeIcon"></i>
        </div>
        <div class="locale-toggle" @click="toggleLocale">
          {{ locale === 'zh' ? 'EN' : '中' }}
        </div>
        <button class="menu-toggle" @click="toggleMenu">
          <i :class="menuIcon"></i>
        </button>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
const router = useRouter()
const route = useRoute()
const isDarkMode = ref(false)
const isMenuOpen = ref(false)

const themeIcon = ref('fas fa-moon')
const menuIcon = ref('fas fa-bars')

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  updateTheme()
}

const toggleLocale = () => {
  const newLocale = locale.value === 'zh' ? 'en' : 'zh'
  locale.value = newLocale
  localStorage.setItem('locale', newLocale)
}

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
  updateMenu()
}

const updateTheme = () => {
  if (isDarkMode.value) {
    document.body.classList.add('dark-mode')
    themeIcon.value = 'fas fa-sun'
    localStorage.setItem('theme', 'dark')
  } else {
    document.body.classList.remove('dark-mode')
    themeIcon.value = 'fas fa-moon'
    localStorage.setItem('theme', 'light')
  }
}

const updateMenu = () => {
  const navMenu = document.querySelector('.nav-menu')
  if (navMenu) {
    if (isMenuOpen.value) {
      navMenu.classList.add('active')
      menuIcon.value = 'fas fa-times'
    } else {
      navMenu.classList.remove('active')
      menuIcon.value = 'fas fa-bars'
    }
  }
}

const scrollToSection = (sectionId: string) => {
  // 关闭移动端菜单
  isMenuOpen.value = false
  updateMenu()

  // 如果当前不在首页，先导航到首页
  if (route.path !== '/') {
    router.push('/').then(() => {
      // 等待页面渲染后滚动到对应部分
      setTimeout(() => {
        const element = document.getElementById(sectionId)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    })
  } else {
    // 已经在首页，直接滚动
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }
}

const handleNavClick = (path: string) => {
  isMenuOpen.value = false
  updateMenu()
  router.push(path)
}

// 初始化主题和语言
onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDarkMode.value = true
    updateTheme()
  }

  const savedLocale = localStorage.getItem('locale')
  if (savedLocale === 'en' || savedLocale === 'zh') {
    locale.value = savedLocale
  }
})
</script>

<style scoped>
/* 添加必要的样式 */
.locale-toggle {
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  background: #f5f5f5;
  color: #333;
  font-size: 0.9rem;
  font-weight: bold;
  margin-left: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  transition: background 0.2s;
}

.locale-toggle:hover {
  background: #e0e0e0;
}

.theme-toggle {
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  background: #f5f5f5;
  color: #333;
  margin-left: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  transition: background 0.2s;
}

.theme-toggle:hover {
  background: #e0e0e0;
}

.container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-menu {
  display: flex;
  gap: 1rem;
}

@media (max-width: 768px) {
  .nav-menu {
    display: none;
  }

  .nav-menu.active {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    padding: 1rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }
}
</style>
