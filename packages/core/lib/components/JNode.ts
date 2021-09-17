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

    const mergedContext = assignObject(context, { scope: props.scope })

    const injector = injectProxy({
      context: mergedContext,
      proxy,
    })

    const renderField = ref()

    const renderChildren = ref()

    const onBeforeRenderHook = () => (field, next) => {
      renderField.value = injector(getProxyDefine(field))

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
          target[slotName].push(
            isVNode(child)
              ? child
              : isObject(child)
              ? h(JNode, { field: child, scope: assignObject(props.scope, child.$scope || {}) })
              : child,
          )
        }

        return target
      }, {})

      renderChildren.value = Object.keys(slotGroups || {}).reduce((target, key) => {
        target[key] = () => slotGroups[key]
        return target
      }, {})

      next(renderField.value)
    }

    const beforeRenders = [...mergedServices.beforeRenderHandlers, onBeforeRenderHook].map(
      (provider) => provider({ context: mergedContext }),
    )

    watch(
      () => props.field,
      (value) => {
        if (!value) {
          renderField.value = null
          return
        }

        pipeline(...beforeRenders)(assignObject(value))
      },
      { immediate: true },
    )

    // 如果children发生变化就重新渲染本节点和以下节点
    watch(
      () => props.field?.children,
      () => {
        pipeline(...beforeRenders)(assignObject(props.field))
      },
    )

    watch(
      () => props.field?.children?.length,
      () => {
        pipeline(...beforeRenders)(assignObject(props.field))
      },
    )

    return () => {
      if (!renderField.value) {
        return
      }

      const renderingComponent =
        toRaw(mergedServices.components[renderField.value?.component]) ||
        renderField.value?.component

      const rendingProps = deepClone(injector(getProxyDefine(renderField.value?.props || {})))

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
