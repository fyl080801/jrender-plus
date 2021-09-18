import { App, nextTick, reactive, watch, h, onBeforeUnmount } from 'vue'
import JRender, { useGlobalRender, JNode, assignObject } from '@jrender-plus/core'
import { deepGet } from '@jrender-plus/core'

export const useRender = (app: App) => {
  app.use(JRender)

  // 全局 render
  useGlobalRender(({ onBeforeRender, onRender, addFunction, addDataSource }) => {
    const forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/

    onBeforeRender(() => (field, next) => {
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

    onBeforeRender(() => (field, next) => {
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

    // // for 表达式，还不知道怎么具体实现vue的for
    onBeforeRender(({ context }) => {
      let cached = null
      const watchList = []

      onBeforeUnmount(() => {
        watchList.forEach((w) => w())
        watchList.length = 0
      })

      return (field, next) => {
        cached = assignObject(field)

        field?.children?.forEach((child) => {
          const matched = forAliasRE.exec(child.for)
          if (matched) {
            const [origin, props, source] = matched
            watchList.push(
              watch(
                () => deepGet(context, source),
                () => {
                  next({})
                  nextTick(() => {
                    next(cached)
                  })
                },
                { deep: true },
              ),
            )
          }
        })

        next(field)
      }
    })

    onRender(({ context }) => (field) => {
      field.children = field.children?.reduce((target, child) => {
        const matched = forAliasRE.exec(child.for)
        if (child.for === undefined || !matched) {
          target.push(child)
        } else {
          const [origin, props, source] = matched
          deepGet(context, source).forEach((item) => {
            target.push(assignObject(child, { for: undefined, $scope: { [props]: item } }))
          })
        }
        return target
      }, [])
      return field
    })
    // onBeforeRender(({ context }) => {
    //   const forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/,
    //     watchList = []
    //   let cached = null

    //   onBeforeUnmount(() => {
    //     watchList.forEach((w) => w())
    //     watchList.length = 0
    //   })

    //   const resolveChildren = (field, cb?) => {
    //     const children = []

    //     field?.children?.forEach((child) => {
    //       const matched = forAliasRE.exec(child.for)

    //       if (child.for === undefined || !matched) {
    //         children.push(child)
    //       } else {
    //         // 怎么实现？
    //         const [origin, obj, source] = matched,
    //           data = deepGet(context, source)

    //         data.forEach((item) => {
    //           children.push(assignObject(child, { for: undefined, $scope: { [obj]: item } }))
    //         })

    //         cb && cb(child, matched)
    //       }
    //     })

    //     return children
    //   }

    //   return (field, next) => {
    //     watchList.forEach((w) => w())
    //     watchList.length = 0

    //     if (!field.children || !field.children.find((child) => child.for !== undefined)) {
    //       return next(field)
    //     }

    //     cached = assignObject(field)

    //     const children = resolveChildren(field, (child, [origin, obj, source]) => {
    //       watchList.push(
    //         watch(
    //           [() => deepGet(context, source), () => deepGet(context, source)?.length],
    //           () => {
    //             // 调 next 是为了重新输出组件定义达到重新渲染
    //             next(assignObject(cached, { for: undefined, children: resolveChildren(cached) }))
    //           },
    //           { deep: true },
    //         ),
    //       )
    //     })

    //     next(assignObject(field, { for: undefined, children }))
    //   }
    // })

    onRender(() => (field) => {
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
