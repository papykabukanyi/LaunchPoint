<template>
  <div>
    <SiteNav />
    <RouterView />
    <SiteFooter />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import SiteNav from './components/SiteNav.vue'
import SiteFooter from './components/SiteFooter.vue'

onMounted(() => {
  if (typeof AOS !== 'undefined') AOS.init({ duration: 700, once: true })
})
</script>
