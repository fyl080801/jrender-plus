import { watch, reactive, nextTick, markRaw, h } from 'vue'
import { JNode, JSlot, deepGet, assignObject, toPath } from '@jrender-plus/core'

export default ({ onBeforeRender, onRender, addDataSource, addFunction }) => {
  // value
  onBeforeRender(() => (field, next) => {
    if (typeof field.value === 'string') {
      const paths = toPath(field.value)
      const path = [...paths].splice(1, paths.length)

      field.props ||= {}
      field.props.value = `$:${field.value}`
      field.props.onInput = `$:(e) => SET(${paths[0]}, '${path.join('.')}', e.target.value)`

      delete field.value
    }
    next(field)
  })

  // model
  onBeforeRender(() => (field, next) => {
    if (typeof field.model === 'string') {
      const paths = toPath(field.model)
      const path = [...paths].splice(1, paths.length)

      field.props ||= {}
      field.props.modelValue = `$:${field.model}`
      field.props['onUpdate:modelValue'] = `$:(e) => SET(${paths[0]}, '${path.join('.')}', e)`

      delete field.model
    }
    next(field)
  })

  // models
  onBeforeRender(() => (field, next) => {
    if (typeof field.models === 'string') {
      const paths = field.models.split('.')
      const path = [...paths].splice(1, paths.length)

      field.props ||= {}
      field.props.modelValue = `$:GET(model, '${path.join('.')}', [])`
      field.props['onUpdate:modelValue'] = `$:(e) => SET(${paths[0]}, '${path.join('.')}', e)`

      delete field.models
    }
    next(field)
  })

  onRender(() => {
    return (field, next) => {
      next(field)
      watch(
        () => field?.props?.condition,
        (value) => {
          if (value !== undefined && !value) {
            next()
          } else {
            next(field)
          }
        },
      )
    }
  })

  const forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/

  // for 表达式，还不知道怎么具体实现vue的for
  onRender(({ context }) => (field, next) => {
    if (!field) {
      return next(field)
    }

    field.children = field?.children?.map((child) => {
      const matched = forAliasRE.exec(child.for)
      if (matched) {
        const [origin, props, source] = matched
        return {
          component: markRaw(JSlot),
          props: {
            renderSlot: () => {
              return deepGet(context, source).map((item, index) =>
                h(JNode, {
                  field: assignObject(child, { for: undefined }),
                  scope: { [props]: item, index },
                }),
              )
            },
          },
        }
      } else {
        return child
      }
    })

    next(field)
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
    return (...args) =>
      nextTick(() => {
        cb(...args)
      })
  })
}
