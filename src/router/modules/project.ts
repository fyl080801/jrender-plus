export const project = [
  {
    path: '/project',
    component: () => import('@/layout/Project.vue'),
    redirect: '/project/pages',
    children: [
      { path: 'pages', name: 'projectPages', component: () => import('@/views/project/Pages.vue') },
      {
        path: 'config',
        name: 'projectConfig',
        component: () => import('@/views/project/Config.vue'),
      },
    ],
  },
]
