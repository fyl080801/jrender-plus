import { defineComponent, computed, toRaw, markRaw, ref, watch, h } from 'vue'
import { assignObject, isPromise } from '../utils/helper'
import { useJRender } from '../utils/mixins'
import { pipeline } from '../utils/pipeline'
import { getProxyDefine, injectProxy } from '../utils/proxy'
import JSlot from './JSlot'

const JNode = defineComponent({
  name: 'JNode',
  props: {
    field: Object,
    scope: { type: Object, default: () => ({}) },
    context: Object,
  },
  setup(props) {
    const { services, slots } = useJRender()

    const sharedServices = {
      context: props.context,
      scope: props.scope,
      props,
      render: () => {
        render(assignObject(getProxyDefine(toRaw(props.field))))
      },
    }

    const injector = injectProxy({
      context: props.context,
      scope: props.scope,
      proxy: services.proxy.map((p) => p({ functional: services.functional })),
    })

    const renderField = ref()

    const renderSlots = computed<any>(() => {
      if (!renderField.value) {
        return []
      }

      const result =
        Object.entries(
          renderField.value.children?.reduce((target, child) => {
            const slotName = child?.slot || 'default'
            target[slotName] ||= []
            target[slotName].push(child)
            return target
          }, {}) || {},
        ) || []

      return result.reduce((target, item: any) => {
        target[item[0]] = (scope) => {
          return item[1].map((field, index) => {
            return h(JNode, {
              key: field.key || index,
              scope: assignObject(props.scope, scope),
              field: getProxyDefine(field),
              context: props.context,
            })
          })
        }
        return target
      }, {})
    })

    const render = pipeline(
      ...[
        ...services.beforeBindHandlers.map((item) => item.handler),
        () => async (field, next) => {
          let nexted

          if (field?.component === 'slot') {
            nexted = next({
              component: markRaw(JSlot),
              props: {
                renderSlot: () => {
                  const renderer = slots[field.name || 'default']
                  return renderer && renderer(field.props || {})
                },
              },
            })
          } else {
            nexted = next(field)
          }

          if (isPromise(nexted)) {
            await nexted
          }
        },
        () => async (field, next) => {
          renderField.value = injector(getProxyDefine(field))
          const nexted = next(renderField.value)
          if (isPromise(nexted)) {
            await nexted
          }
        },
        ...services.bindHandlers.map((item) => item.handler),
        () => async (field, next) => {
          renderField.value = field
          const nexted = next(renderField.value)
          if (isPromise(nexted)) {
            await nexted
          }
        },
      ].map((provider) => provider(sharedServices)),
    )

    // const getTemplateScope = (s) => {
    //   return Object.keys(s || {}).length ? s : undefined
    // }

    watch(
      () => props.field,
      () => {
        if (props.field) {
          render(assignObject(getProxyDefine(toRaw(props.field))))
        }
      },
      { immediate: true },
    )

    return () => {
      return (
        renderField.value &&
        renderField.value.component &&
        h(
          services.components[renderField.value.component] || renderField.value.component,
          renderField.value.props,
          renderSlots.value,
        )
      )
    }
  },
})

export default JNode
