import { createRouter, createWebHistory } from 'vue-router'
import HomeView     from '../views/HomeView.vue'
import AboutView    from '../views/AboutView.vue'
import PlatformView from '../views/PlatformView.vue'
import EventsView   from '../views/EventsView.vue'
import NotFoundView from '../views/NotFoundView.vue'

const routes = [
  { path: '/',         component: HomeView,     meta: { title: 'Blue Ocean Strategies — Election Marketing Firm' } },
  { path: '/about',    component: AboutView,    meta: { title: 'About — Blue Ocean Strategies' } },
  { path: '/platform', component: PlatformView, meta: { title: 'Platform — Blue Ocean Strategies' } },
  { path: '/events',   component: EventsView,   meta: { title: 'Events — Blue Ocean Strategies' } },
  { path: '/:pathMatch(.*)*', component: NotFoundView, meta: { title: '404 — Blue Ocean Strategies' } }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0, behavior: 'smooth' }
  }
})

router.afterEach((to) => {
  document.title = to.meta.title || 'Blue Ocean Strategies'
  // Re-init AOS on each route change
  if (typeof AOS !== 'undefined') {
    setTimeout(() => AOS.refresh(), 100)
  }
})

export default router
