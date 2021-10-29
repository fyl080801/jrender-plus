import { createApp } from 'vue'
import App from './App.vue'
import { useElementUI, useAntd, useRender } from './components'
import { useAppRouter } from './router'
// import '@/styles/index.css'
import 'bootstrap/scss/bootstrap.scss'

const app = createApp(App)

useElementUI(app)
useAntd(app)
useAppRouter(app)
useRender(app)

app.mount('#app')
