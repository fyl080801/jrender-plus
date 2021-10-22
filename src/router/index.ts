import { createRouter, createWebHistory } from 'vue-router'
import { App } from 'vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/demos',
      component: () => import('@/layout/Layout.vue'),
      redirect: '/demos/sample',
      children: [
        { path: 'sample', name: 'sample', component: () => import('@/views/Sample.vue') },
        // {
        //   path: 'designer',
        //   name: 'designer',
        //   component: () => import('@/views/designer/Layout.vue'),
        // },
        {
          path: 'nesting',
          name: 'nesting',
          component: () => import('@/views/Nesting.vue'),
        },
      ],
    },
    {
      path: '/eltest',
      component: () => import('@/views/ElementTest.vue'),
    },
    {
      path: '/vuetest',
      component: () => import('@/views/VueTest.vue'),
    },
    {
      path: '/',
      redirect: '/demos',
    },
  ],
})

export const useAppRouter = (app: App) => {
  app.use(router)
}
