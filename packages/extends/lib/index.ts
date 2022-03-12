import { watch, reactive, nextTick, markRaw, h, defineComponent } from 'vue'
import { JNode, deepGet, assignObject, toPath } from '@jrender-plus/core'

export default ({ onBeforeBind, onBind, addDataSource, addFunction }) => {
  // type 简写
  onBeforeBind(() => (field, next) => {
    if (field.type !== undefined) {
      field.component = field.type
    }

    next(field)
  })

  // text
  onBeforeBind(() => (field, next) => {
    if (field.text !== undefined) {
      field.props = field.props || {}
      field.props.innerText = field.text
    }

    next(field)
  })

  // 条件显示
  onBind(() => {
    let watcher = null

    return (field, next) => {
      if (watcher) {
        watcher()
      }

      watcher = watch(
        () => field.condition,
        (value) => {
          if (value !== undefined && !value) {
            next()
          } else {
            next(field)
          }
        },
        { immediate: true },
      )
    }
  })

  // value
  onBeforeBind(() => (field, next) => {
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
  onBeforeBind(() => (field, next) => {
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
  onBeforeBind(() => (field, next) => {
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

  const forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/

  // for 表达式，还不知道怎么具体实现vue的for
  onBind(({ context }) => {
    return (field, next) => {
      if (!field) {
        return next(field)
      }

      field.children = field?.children?.map((child) => {
        const matched = forAliasRE.exec(child.for)
        if (matched) {
          const [origin, prop, source] = matched
          return {
            component: markRaw(
              defineComponent({
                setup() {
                  return () =>
                    deepGet(context, source)?.map((item, index) => {
                      return h(JNode, {
                        field: assignObject(child, { for: undefined }),
                        scope: { [prop]: item, index },
                        context,
                      })
                    })
                },
              }),
            ),
          }
        } else {
          return child
        }
      })

      next(field)
    }
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
