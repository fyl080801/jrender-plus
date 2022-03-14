import { App, nextTick, reactive } from 'vue'
import JRender, { useGlobalRender } from '@jrender-plus/core'
import Extends from '@jrender-plus/extends'

export const useRender = (app: App) => {
  app.use(JRender)

  useGlobalRender(Extends)

  useGlobalRender(({ addDataSource }) => {
    addDataSource('fetch', (getOptions) => {
      const { autoLoad } = getOptions()
      const instance = reactive({
        fetch: async () => {
          const options = getOptions()
          try {
            instance.loading = true
            const response: any = await fetch(options.url, options.props)
            const result = await response[options.type || 'json']()
            setTimeout(() => {
              instance.data = result
              instance.loading = false
            }, options.fakeTimeout || 0)
          } catch {
            instance.data = options.defaultData || []
            instance.loading = false
          }
        },
        clear: () => {
          instance.data = getOptions()?.defaultData || []
        },
        loading: false,
        data: getOptions()?.defaultData || [],
      })
      if (autoLoad) {
        nextTick(() => {
          instance.fetch()
        })
      }
      return instance
    })
  })
}
