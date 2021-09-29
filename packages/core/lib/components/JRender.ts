import {
  defineComponent,
  reactive,
  isReactive,
  watch,
  ref,
  computed,
  nextTick,
  h,
  toRefs,
} from 'vue'
import { assignArray, assignObject, deepClone, isArray, isFunction } from '../utils/helper'
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
      model: isReactive(props.modelValue) ? props.modelValue : toRefs(props.modelValue),
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
        context.model = isReactive(props.modelValue) ? props.modelValue : toRefs(props.modelValue)
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

    //#region fields
    const roots = ref([])
    const updating = ref(false)
    const isArrayRoot = computed(() => {
      return isArray(roots.value)
    })
    watch(
      () => props.fields,
      (value) => {
        updating.value = true

        nextTick(() => {
          roots.value = isArray(value) ? assignArray(value) : assignObject(value)
          updating.value = false
        })
      },
      { deep: false, immediate: true },
    )
    //#endregion

    useListener(props, { injector })

    return () =>
      !updating.value
        ? isArrayRoot.value
          ? roots.value.map((field) => h(JNode, { field }))
          : h(JNode, { field: roots })
        : null
  },
})
