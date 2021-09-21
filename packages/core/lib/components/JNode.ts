import { defineComponent, ref, watch, h, resolveDynamicComponent, toRaw, isVNode } from 'vue'
import { assignObject, deepClone, isFunction, isObject, isArray } from '../utils/helper'
import { useJRender, useScope } from '../utils/mixins'
import { pipeline } from '../utils/pipeline'
import { getProxyDefine, injectProxy } from '../utils/proxy'

const JNode = defineComponent({
  props: {
    field: { type: Object, required: true },
    scope: Object,
  },
  setup(props) {
    const { context, services, render } = useJRender()

    const { scope } = useScope(props.scope || {})

    const mergedContext = assignObject(context, { scope })

    const sharedServices = { context: mergedContext, renderNode }

    const injector = injectProxy({
      context: mergedContext,
      proxy: services.proxy.map((p) => p({ functional: services.functional })),
    })

    const renderField = ref()

    const beforeRenders = [
      ...services.beforeRenderHandlers,
      () => (field, next) => {
        renderField.value = injector(getProxyDefine(field))
        next(renderField.value)
      },
    ].map((provider) => provider(sharedServices))

    const renders = [
      ...services.renderHandlers,
      () => (field) => {
        if (!field) {
          return field
        }

        field.children = Object.entries(
          field.children?.reduce((target, child) => {
            const slotName = child?.slot || 'default'
            target[slotName] ||= []

            if (child?.component === 'slot') {
              const slot = render.slots[child.name || 'default']
              isFunction(slot) &&
                slot(scope).forEach((node) => {
                  target[slotName].push(node)
                })
            } else {
              target[slotName].push(child)
            }

            return target
          }, {}) || {},
        ).reduce((target, [key, value]) => {
          target[key] = (slotScope) =>
            (value as any).map((child) =>
              isVNode(child) ? child : isObject(child) ? renderNode(child, slotScope) : child,
            )
          return target
        }, {})

        return field
      },
    ].map((provider) => provider(sharedServices))

    watch(
      [() => props.field, () => props.field?.children, () => props.field?.children?.length],
      () => {
        if (!props.field) {
          renderField.value = null
          return
        }
        pipeline(...beforeRenders)(assignObject(props.field))
      },
      { immediate: true },
    )

    return () => {
      if (!renderField.value?.component) {
        return
      }

      let rending = assignObject(
        deepClone(assignObject(renderField.value, { children: undefined })),
        {
          component:
            toRaw(services.components[renderField.value?.component]) ||
            renderField.value?.component,
          children: renderField.value.children,
        },
      )

      for (const render of renders) {
        if (!rending?.component) {
          return
        }
        rending = render(rending)
      }

      return h(resolveDynamicComponent(rending.component) as any, rending.props, rending.children)
    }
  },
})

export const renderNode = (field, scope?) => h(JNode, { field, scope })

export default JNode
