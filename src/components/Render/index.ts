import { App, nextTick, reactive } from 'vue'
import JRender, { useGlobalRender } from '@jrender-plus/core'

export const useRender = (app: App) => {
  app.use(JRender)

  useGlobalRender(({ onBeforeRender, onRender, addFunction, addDataSource }) => {
    onBeforeRender((field, next) => {
      if (typeof field.value === 'string') {
        const paths = field.value.split('.')
        const path = [...paths].splice(1, paths.length)

        field.props ||= {}
        field.props.value = `$:${field.value}`
        field.props.onInput = `$:(e) => SET(${paths[0]}, '${path.join('.')}', e.target.value)`

        delete field.value
      }
      next(field)
    })

    onBeforeRender((field, next) => {
      if (typeof field.model === 'string') {
        const paths = field.model.split('.')
        const path = [...paths].splice(1, paths.length)

        field.props ||= {}
        field.props.modelValue = `$:${field.model}`
        field.props['onUpdate:modelValue'] = `$:(e) => SET(${paths[0]}, '${path.join('.')}', e)`

        delete field.model
      }
      next(field)
    })

    onRender((field) => {
      if (field.props?.condition !== undefined && !field.props.condition) {
        return null
      }

      return field
    })

    addDataSource('fetch', (opt) => {
      const { autoLoad } = opt()
      const instance = reactive({
        fetch: async () => {
          const options: any = opt()
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
          instance.data = opt()?.defaultData || []
        },
        loading: false,
        data: opt()?.defaultData || [],
      })

      if (autoLoad) {
        nextTick(() => {
          instance.fetch()
        })
      }

      return instance
    })

    addFunction('NEXTTICK', (cb) => {
      nextTick(cb)
    })
  })
}
