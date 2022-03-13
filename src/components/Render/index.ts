import { App } from 'vue'
import JRender from '@jrender-plus/core'
// import Extends from '@jrender-plus/extends'
// import ElementPlus from '@jrender-plus/element-plus'

export const useRender = (app: App) => {
  app.use(JRender)

  // useGlobalRender(Extends)
  // useGlobalRender(ElementPlus)
}
