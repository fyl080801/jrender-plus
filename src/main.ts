import { createApp } from 'vue'
import App from './App.vue'
import { useElementUI, useRender } from './components'
import { useAppRouter } from './router'
import '@/styles/index.css'

const app = createApp(App)

useElementUI(app)
useAppRouter(app)
useRender(app)

app.mount('#app')
