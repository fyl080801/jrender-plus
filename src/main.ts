import { createApp } from 'vue'
import App from './App.vue'
import { useElementUI, useAntd, useRender } from './components'
import { useAppRouter } from './router'
import 'virtual:windi.css'

const app = createApp(App)

useElementUI(app)
useAntd(app)
useAppRouter(app)
useRender(app)

app.mount('#app')
