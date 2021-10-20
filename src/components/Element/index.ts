import { App } from 'vue'
import ElementUI from 'element-plus'
import 'element-plus/theme-chalk/index.css'

export const useElementUI = (app: App) => {
  app.use(ElementUI, { size: 'small' })
}
