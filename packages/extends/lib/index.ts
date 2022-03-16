import { watch, onBeforeUnmount, markRaw, h, defineComponent, computed } from 'vue'
import {
  JNode,
  assignObject,
  toPath,
  defineRenderSetup,
  compute,
  getProxyDefine,
} from '@jrender-plus/core'

export default defineRenderSetup(({ onBeforeBind, onBind }) => {
  // type 简写
  onBeforeBind(({ props }) => {
    if (props.field?.type !== undefined) {
      props.field.component = props.field.type
      delete props.field.type
    }

    return (field, next) => {
      next(field)
    }
  }).name('type')

  // 条件显示
  onBind(() => {
    let watcher = null

    onBeforeUnmount(() => {
      watcher && watcher()
    })

    return (field, next) => {
      watcher && watcher()

      if (typeof field?.condition === 'function') {
        watcher = watch(
          field.condition,
          (value) => {
            if (value !== undefined && !value) {
              next({})
            } else {
              next(field)
            }
          },
          { immediate: true },
        )
      } else {
        next(field)
      }
    }
  }).name('condition')

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

  // for 表达式，还不知道怎么具体实现vue的for
  onBind(({ context, scope, services }) => {
    const forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/

    return (field, next) => {
      if (!field) {
        return next(field)
      }

      field.children = field?.children?.map((child) => {
        const matched = forAliasRE.exec(child.for)
        if (matched) {
          const [origin, prop, source] = matched

          const ForComponent = defineComponent({
            setup() {
              const computeProxy = compute(services)

              const forList = computed(() => {
                try {
                  return computeProxy(`$:${source}`)(assignObject(context, scope))
                } catch {
                  return []
                }
              })

              return () =>
                forList.value?.map((item, index) => {
                  return h(JNode, {
                    field: assignObject(getProxyDefine(child), { for: undefined }),
                    scope: { [prop]: item, index },
                    context,
                  })
                })
            },
          })

          return {
            component: markRaw(ForComponent),
          }
        } else {
          return child
        }
      })

      next(field)
    }
  })
})
