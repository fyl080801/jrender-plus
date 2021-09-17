import {
  defineComponent,
  ref,
  watch,
  h,
  resolveDynamicComponent,
  nextTick,
  onBeforeUnmount,
  toRaw,
  isVNode,
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

    const field = ref()

    const renderField = ref()

    const renderChildren = ref()

    const forWatch = []

    const forceUpdate = () => {
      const cache = field.value

      field.value = null

      nextTick(() => {
        field.value = cache
      })
    }

    const clearWatch = () => {
      forWatch.forEach((watcher) => watcher())
      forWatch.length = 0
    }

    const onBeforeRenderHook = (field, next) => {
      renderField.value = injectProxy({
        context: assignObject({}, context, { scope: props.scope }),
        proxy,
      })(field)

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
            forWatch.push(
              watch(
                () => child.for,
                () => {
                  forceUpdate()
                },
              ),
            )

            child.for.forEach((data, i) => {
              target[slotName].push(
                h(JNode, {
                  field: child,
                  scope: isObject(data)
                    ? assignObject(props.scope, data, { $index: i })
                    : assignObject(props.scope, { $index: i }),
                }),
              )
            })
          } else {
            target[slotName].push(
              isVNode(child) || !isObject(child)
                ? child
                : h(JNode, { field: child, scope: props.scope }),
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

        pipeline(...mergedServices.beforeRenderHandlers, onBeforeRenderHook)(assignObject(value))
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

      const renderingComponent =
        toRaw(mergedServices.components[renderField.value?.component]) ||
        renderField.value?.component

      const rendingProps = deepClone(
        injectProxy({
          context: assignObject({}, context, { scope: props.scope }),
          proxy,
        })(getProxyDefine(renderField.value?.props || {})),
      )

      let rending = {
        ...(renderField.value || {}),
        component: renderingComponent,
        props: rendingProps,
        // 渲染中不能操作children
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
