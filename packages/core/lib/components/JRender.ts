import { defineComponent, reactive, watch, ref, computed, nextTick, h } from 'vue'
import { assignArray, assignObject, isArray, isFunction } from '../utils/helper'
import { useJRender, useScope, useListener, useServices } from '../utils/mixins'
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
  components: { JNode },
  emits: ['setup'],
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
      context,
      render: ctx,
      services,
      props,
    })

    useScope({})

    watch(
      () => props.modelValue,
      () => {
        context.model = props.modelValue
      },
      { immediate: true },
    )

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
    //

    useListener(props, { injector })

    return () =>
      isArrayRoot.value
        ? props.fields.map((field) => h(JNode, { field }))
        : h(JNode, { field: props.fields })
  },
})
