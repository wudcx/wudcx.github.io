<template>
  <div class="home">
    <main>
      <Hero />
      <Articles />
      <About />
      <Projects />
      <Contact />
    </main>
  </div>
</template>

<script setup lang="ts">
import Hero from '../components/Hero.vue'
import Articles from '../components/Articles.vue'
import About from '../components/About.vue'
import Projects from '../components/Projects.vue'
import Contact from '../components/Contact.vue'
</script>

<style scoped>
.home {
  min-height: calc(100vh - 160px);
}
</style>