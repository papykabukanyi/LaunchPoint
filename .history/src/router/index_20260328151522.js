import { createRouter, createWebHistory } from 'vue-router'
import HomeView     from '../views/HomeView.vue'
import AboutView    from '../views/AboutView.vue'
import ServiceView  from '../views/ServiceView.vue'
import NotFoundView from '../views/NotFoundView.vue'

const routes = [
  { path: '/',         component: HomeView,     meta: { title: 'LaunchPoint DM — Development & Marketing' } },
  { path: '/about',    component: AboutView,    meta: { title: 'About Us — LaunchPoint DM' } },
  { path: '/service',  component: ServiceView,  meta: { title: 'Services & Pricing — LaunchPoint DM' } },
  { path: '/:pathMatch(.*)*', component: NotFoundView, meta: { title: '404 — LaunchPoint DM' } }
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
  document.title = to.meta.title || 'LaunchPoint DM'
  // Re-init AOS on each route change
  if (typeof AOS !== 'undefined') {
    setTimeout(() => AOS.refresh(), 100)
  }
})

export default router
