import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import zh from './locales/zh.json'

export type MessageSchema = typeof en

const i18n = createI18n<[MessageSchema], 'en' | 'zh'>({
  legacy: false,
  locale: 'zh',
  fallbackLocale: 'en',
  messages: {
    en,
    zh
  }
})

export default i18n