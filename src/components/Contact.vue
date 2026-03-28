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
.contact {
  padding: 5rem 0;
  background: var(--bg-secondary);
}

.contact h2 {
  font-family: 'Roboto Slab', serif;
  font-size: 2.25rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 3rem;
}

.contact-content {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 4rem;
  max-width: 1000px;
  margin: 0 auto;
}

.contact-info p {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
  font-size: 1.05rem;
  color: var(--text-color);
}

.contact-info i {
  width: 40px;
  height: 40px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  border-radius: 10px;
  font-size: 1rem;
}

.social-links {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.social-links a {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 44px;
  height: 44px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 50%;
  color: var(--text-color);
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.social-links a:hover {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
  transform: translateY(-3px);
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.contact-form input,
.contact-form textarea {
  width: 100%;
  padding: 1rem 1.25rem;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  color: var(--text-color);
  font-family: inherit;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.contact-form input:focus,
.contact-form textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.contact-form textarea {
  resize: vertical;
  min-height: 120px;
}

.contact-form .btn {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: var(--radius);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.contact-form .btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
}

@media (max-width: 768px) {
  .contact {
    padding: 3rem 0;
  }

  .contact-content {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
}
</style>