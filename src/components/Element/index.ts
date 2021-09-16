import { App } from 'vue'
import Element from 'element-plus'
import 'element-plus/theme-chalk/index.css'

export const useElementUI = (app: App) => {
  app.use(Element)
}
