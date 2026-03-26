<template>
  <section id="contact" class="contact">
    <div class="container">
      <h2 class="section-title">{{ t('contact.title') }}</h2>
      <div class="contact-content">
        <div class="contact-info">
          <p><i class="fas fa-envelope"></i> wudcx@example.com</p>
          <p><i class="fas fa-globe"></i> https://wudcx.com</p>
          <p><i class="fab fa-github"></i> github.com/wudcx</p>
          <div class="social-links">
            <a href="#"><i class="fab fa-twitter"></i></a>
            <a href="#"><i class="fab fa-linkedin"></i></a>
            <a href="#"><i class="fab fa-github"></i></a>
            <a href="#"><i class="fab fa-codepen"></i></a>
          </div>
        </div>
        <form class="contact-form" @submit.prevent="submitForm">
          <input type="text" :placeholder="t('contact.namePlaceholder')" required v-model="form.name">
          <input type="email" :placeholder="t('contact.emailPlaceholder')" required v-model="form.email">
          <textarea :placeholder="t('contact.messagePlaceholder')" rows="4" required v-model="form.message"></textarea>
          <button type="submit" class="btn">{{ t('contact.sendMessage') }}</button>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

interface FormData {
  name: string
  email: string
  message: string
}

const { t } = useI18n()

const form = ref<FormData>({
  name: '',
  email: '',
  message: ''
})

const submitForm = () => {
  // 简单验证
  if (!form.value.name || !form.value.email || !form.value.message) {
    showNotification(t('contact.notification.fillAll'), 'error')
    return
  }

  if (!isValidEmail(form.value.email)) {
    showNotification(t('contact.notification.invalidEmail'), 'error')
    return
  }

  // 模拟提交
  showNotification(t('contact.notification.sending'), 'info')
  
  setTimeout(() => {
    console.log('表单数据:', form.value)
    showNotification(t('contact.notification.success'), 'success')
    form.value = { name: '', email: '', message: '' }
  }, 1500)
}

const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const showNotification = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
  // 简单的通知实现（可以替换为更完整的通知组件）
  alert(`${type}: ${message}`)
}
</script>

<style scoped>
/* 组件特定样式 */
</style>