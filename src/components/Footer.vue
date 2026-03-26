<template>
  <footer>
    <div class="container">
      <p>{{ t('footer.copyright') }}</p>
      <p>{{ t('footer.disclaimer') }}</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style scoped>
/* 组件特定样式 */
</style>