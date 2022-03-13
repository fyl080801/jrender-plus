import { defineComponent, useSlots, reactive, computed, watch, h } from 'vue'
import { isArray, isFunction } from '../utils/helper'
import { useJRender, useListener, useServices } from '../utils/mixins'
import { injectProxy } from '../utils/proxy'
import JNode from './JNode'

export default defineComponent({
  name: 'JRender',
  props: {
    modelValue: { type: Object, default: () => ({}) },
    fields: { type: [Array, Object], default: () => [] },
    listeners: { type: Array, default: () => [] },
    dataSource: { type: Object, default: () => ({}) },
  },
  emits: ['update:modelValue', 'setup'],
  setup(props, ctx) {
    const services = useServices({ emit: ctx.emit })

    const context = reactive({
      model: props.modelValue,
      refs: {},
    })

    const isArrayRoot = computed(() => {
      return isArray(props.fields)
    })

    const injector = injectProxy({
      context,
      proxy: services.proxy.map((p) => p({ functional: services.functional })),
    })

    useJRender({
      services,
      props,
      slots: useSlots(),
    })

    // dataSource
    watch(
      () => props.dataSource,
      (value, origin) => {
        Object.keys(origin || {}).forEach((key) => {
          delete context[key]
        })

        Object.keys(value || {}).forEach((key) => {
          const info = value[key]
          const provider = services.dataSource[info.type || 'default']

          if (['model', 'scope', 'arguments', 'refs'].indexOf(key) < 0 && isFunction(provider)) {
            context[key] = provider(() => injector(info.props))
          }
        })
      },
      { immediate: true },
    )

    watch(
      () => context.model,
      (value) => {
        ctx.emit('update:modelValue', value)
      },
    )

    useListener(props, { injector })

    return () => {
      if (isArrayRoot.value) {
        return props.fields.map((field) => h(JNode, { field, context }))
      } else {
        return h(JNode, { field: props.fields, context })
      }
    }
  },
})
