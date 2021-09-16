import {
  defineComponent,
  ref,
  watch,
  h,
  resolveDynamicComponent,
  nextTick,
  onBeforeUnmount,
} from 'vue'
import { assignObject, deepClone, isFunction, isObject, isArray } from '../utils/helper'
import { useJRender } from '../utils/mixins'
import { pipeline } from '../utils/pipeline'
import { getProxyDefine, injectProxy } from '../utils/proxy'

const JNode = defineComponent({
  props: {
    field: { type: Object, required: true },
    scope: { type: [Object, String, Number, Boolean], default: () => ({}) },
  },
  setup(props) {
    const { context, mergedServices, slots } = useJRender()

    const proxy = mergedServices.proxy.map((p) => p({ functional: mergedServices.functional }))

    const injector = injectProxy({
      context: assignObject({}, context, { scope: props.scope }),
      proxy,
    })

    const field = ref()

    const renderField = ref()

    const renderChildren = ref()

    const watchList = []

    const forceUpdate = () => {
      const cache = field.value

      field.value = null

      nextTick(() => {
        field.value = cache
      })
    }

    const clearWatch = () => {
      watchList.forEach((watcher) => watcher())
      watchList.length = 0
    }

    watch(
      () => props.field,
      (value) => {
        field.value = value
      },
      { immediate: true },
    )

    watch(
      () => field.value,
      (value) => {
        clearWatch()

        if (!value) {
          renderField.value = null
          return
        }

        pipeline(...mergedServices.beforeRenderHandlers, (field, next) => {
          renderField.value = injector(field)

          const slotGroups = renderField.value?.children?.reduce((target, child) => {
            const slotName = child?.slot || 'default'
            target[slotName] ||= []

            if (child?.component === 'slot') {
              const slot = slots[child.name || 'default']
              if (isFunction(slot)) {
                slot(
                  isObject(props.scope) ? assignObject(child.props, props.scope) : props.scope,
                ).forEach((node) => {
                  target[slotName].push(node)
                })
              }
            } else {
              if (isArray(child?.for)) {
                watchList.push(
                  watch(
                    () => child.for,
                    () => {
                      forceUpdate()
                    },
                  ),
                )

                child.for.forEach((data) => {
                  target[slotName].push(
                    h(JNode, {
                      field: child,
                      scope: isObject(data) ? assignObject(props.scope, data) : data,
                    }),
                  )
                })
              } else {
                target[slotName].push(
                  isObject(child) ? h(JNode, { field: child, scope: props.scope }) : child,
                )
              }
            }

            return target
          }, {})

          renderChildren.value = Object.keys(slotGroups || {}).reduce((target, key) => {
            target[key] = () => slotGroups[key]
            return target
          }, {})

          next(renderField.value)
        })(assignObject(value))
      },
      { immediate: true },
    )

    // 如果children发生变化就重新渲染本节点和以下节点
    watch(
      () => props.field?.children,
      () => {
        forceUpdate()
      },
    )

    watch(
      () => props.field?.children?.length,
      () => {
        forceUpdate()
      },
    )

    onBeforeUnmount(() => {
      clearWatch()
    })

    return () => {
      if (!renderField.value) {
        return
      }

      const injector = injectProxy({
        context: assignObject({}, context, { scope: props.scope }),
        proxy,
      })

      const renderComponent =
        mergedServices.components[renderField.value?.component] || renderField.value?.component

      let rending = {
        ...(renderField.value || {}),
        component: renderComponent,
        props: deepClone(injector(getProxyDefine(renderField.value?.props || {}))),
        children: undefined,
      }

      for (let i = 0; i < mergedServices.renderHandlers.length; i++) {
        if (rending) {
          rending = mergedServices.renderHandlers[i](rending)
        }
      }

      return (
        rending &&
        rending.component &&
        h(resolveDynamicComponent(rending.component) as any, rending.props, renderChildren.value)
      )
    }
  },
})

export default JNode
