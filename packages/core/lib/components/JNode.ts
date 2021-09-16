import { defineComponent, ref, watch, h, resolveDynamicComponent, nextTick } from 'vue'
import { assignObject, deepClone, isFunction } from '../utils/helper'
import { useJRender } from '../utils/mixins'
import { pipeline } from '../utils/pipeline'
import { injectProxy } from '../utils/proxy'

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

    const cacheField = ref(props.field)

    const renderField = ref()

    const renderChildren = ref()

    watch(
      () => props.field,
      (value) => {
        cacheField.value = value
      },
    )

    watch(
      () => cacheField.value,
      (value) => {
        pipeline(...mergedServices.beforeRenderHandlers, (field, next) => {
          renderField.value = injector(field)

          const slotGroups = renderField.value?.children?.reduce((target, child) => {
            const slotName = child.slot || 'default'
            target[slotName] ||= []

            if (child.component === 'slot') {
              const slot = slots[child.name || 'default']
              if (isFunction(slot)) {
                slot(assignObject(child.props, props.scope)).forEach((node) => {
                  target[slotName].push(node)
                })
              }
            } else {
              target[slotName].push(h(JNode, { field: child, scope: props.scope }))
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

    watch(
      () => props.field?.children,
      () => {
        const cache = cacheField.value

        cacheField.value = null

        nextTick(() => {
          cacheField.value = cache
        })
      },
    )

    watch(
      () => props.field?.children?.length,
      () => {
        const cache = cacheField.value

        cacheField.value = null

        nextTick(() => {
          cacheField.value = cache
        })
      },
    )

    return () => {
      if (!renderField.value) {
        return
      }

      const renderComponent =
        mergedServices.components[renderField.value?.component] || renderField.value?.component

      let rending = {
        ...(renderField.value || {}),
        component: renderComponent,
        props: deepClone(renderField.value?.props || {}),
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
