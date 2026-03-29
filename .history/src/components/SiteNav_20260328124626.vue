<template>
  <nav class="bos-nav" :class="{ scrolled: isScrolled }" id="bos-nav">
    <div class="nav-inner">
      <RouterLink to="/" class="bos-logo">
        <i class="fas fa-water" style="color:#f4a832;"></i>
        <div>
          <span>Blue Ocean Strategies</span>
          <span class="logo-sub">Election Marketing Firm</span>
        </div>
      </RouterLink>
      <button class="nav-toggler-btn" @click="mobileOpen = !mobileOpen">
        <i :class="mobileOpen ? 'fas fa-times' : 'fas fa-bars'"></i>
      </button>
      <ul class="nav-links-list" :class="{ open: mobileOpen }">
        <li><RouterLink to="/" exact-active-class="active" @click="mobileOpen=false">Home</RouterLink></li>
        <li><RouterLink to="/about" active-class="active" @click="mobileOpen=false">About</RouterLink></li>
        <li><RouterLink to="/platform" active-class="active" @click="mobileOpen=false">Services</RouterLink></li>
        <li><RouterLink to="/events" active-class="active" @click="mobileOpen=false">Events</RouterLink></li>
        <li><a href="#contact" @click="mobileOpen=false">Contact</a></li>
        <li><a href="#newsletter-section" style="color:#f4a832 !important;" @click="mobileOpen=false"><i class="fas fa-envelope me-1"></i>Newsletter</a></li>
        <li><a href="#contact" class="nav-cta-btn" @click="mobileOpen=false">Get Started</a></li>
      </ul>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isScrolled = ref(false)
const mobileOpen = ref(false)

function onScroll() {
  isScrolled.value = window.scrollY > 30
}

onMounted(() => window.addEventListener('scroll', onScroll))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>
