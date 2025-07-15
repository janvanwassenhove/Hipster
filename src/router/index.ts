import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// Lazy load components
const HomeView = () => import('@/views/HomeView.vue')
const GameView = () => import('@/views/GameView.vue')
const SettingsView = () => import('@/views/SettingsView.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      title: 'Hitster - Music Timeline Game'
    }
  },
  {
    path: '/game',
    name: 'game',
    component: GameView,
    meta: {
      title: 'Hitster - Game'
    }
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsView,
    meta: {
      title: 'Hitster - Settings'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

export const router = createRouter({
  history: createWebHashHistory('/Hipster/'),
  routes
})

// Update page title based on route
router.beforeEach((to) => {
  document.title = to.meta?.title as string || 'Hitster'
})
