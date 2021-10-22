import { App } from 'vue'
import JRender, { useGlobalRender } from '@jrender-plus/core'
import JRenderPlusExtends from '@jrender-plus/extends'
import JRPElementPlus from '@jrender-plus/element-plus'

export const useRender = (app: App) => {
  app.use(JRender)

  // 全局 render
  useGlobalRender(JRenderPlusExtends)
  useGlobalRender(JRPElementPlus)
}
