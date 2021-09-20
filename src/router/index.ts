import { createRouter, createWebHistory } from 'vue-router'
import { App } from 'vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/sample',
      name: 'sample',
      component: () => import('@/views/Sample.vue'),
    },
    {
      path: '/table',
      name: 'table',
      component: () => import('@/views/Table.vue'),
    },
    {
      path: '/designer',
      name: 'designer',
      component: () => import('@/views/designer/Layout.vue'),
    },
    {
      path: '/nesting',
      name: 'nesting',
      component: () => import('@/views/Nesting.vue'),
    },
    {
      path: '/',
      redirect: '/sample',
    },
  ],
})

export const useAppRouter = (app: App) => {
  app.use(router)
}
