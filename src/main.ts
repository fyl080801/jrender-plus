import { createApp } from 'vue'
import App from './App.vue'
import { useElementUI, useAntd, useRender } from './components'
import { useAppRouter } from './router'
import { initLocalDB } from './utils/storage'
import 'virtual:windi.css'

const bootstrap = async () => {
  try {
    await initLocalDB()

    const app = createApp(App)

    useElementUI(app)
    useAntd(app)
    useAppRouter(app)
    useRender(app)

    app.mount('#app')
  } catch (error) {
    console.warn(error)
  }
}

bootstrap()
