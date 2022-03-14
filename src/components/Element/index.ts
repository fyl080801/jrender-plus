import { App } from 'vue'
import ElementUI from 'element-plus'
import 'element-plus/theme-chalk/index.css'
import { useGlobalRender } from '@jrender-plus/core'

export const useElementUI = (app: App) => {
  app.use(ElementUI, { size: 'small' })

  useGlobalRender(({ onBeforeBind }) => {
    onBeforeBind(() => (field, next) => {
      if (!field?.formItem) {
        return next(field)
      }

      const formItem = field.formItem
      const condition = field.condition

      delete field.formItem
      delete field.condition

      return next({
        component: 'el-form-item',
        condition,
        props: formItem,
        children: [field],
      })
    })
  })
}
