import {
  defineComponent,
  reactive,
  isReactive,
  watch,
  ref,
  computed,
  nextTick,
  onBeforeMount,
  h,
  resolveComponent,
} from 'vue'
import { assignArray, assignObject, deepClone, isArray, isFunction } from '../utils/helper'
import { useRootRender, useJRender } from '../utils/mixins'
import { injectProxy } from '../utils/proxy'
import { createServiceProvider, mergeServices, globalServiceProvider } from '../utils/service'
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
  emits: ['setup', 'update:modelValue'],
  setup(props, { emit, slots }) {
    const provider = createServiceProvider()

    const rootServices = useRootRender()

    emit('setup', provider.getSetting())

    const context = reactive({
      model: isReactive(props.modelValue) ? props.modelValue : reactive(props.modelValue),
    })

    const mergedServices = mergeServices(
      globalServiceProvider.getServices(),
      rootServices,
      provider.getServices(),
    )

    useJRender({
      context,
      slots,
      // fields: props.fields,
      mergedServices,
    })

    watch(
      () => context.model,
      (value) => {
        emit('update:modelValue', value)
      },
      {},
    )

    const injector = injectProxy({
      context,
      proxy: mergedServices.proxy.map((p) => p({ functional: mergedServices.functional })),
    })

    // dataSource
    watch(
      () => props.dataSource,
      (value) => {
        Object.keys(value || {}).forEach((key) => {
          const info = value[key]
          const provider = mergedServices.dataSource[info.type || 'default']

          if (['model', 'scope', 'arguments', 'refs'].indexOf(key) < 0 && isFunction(provider)) {
            context[key] = provider(() => injector(info.props))
          }
        })
      },
      { immediate: true },
    )
    //

    //#region fields
    const roots = ref(props.fields)
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
      {},
    )
    //#endregion

    //#region listeners 监听
    const watchList = []
    watch(
      () => props.listeners,
      (value) => {
        watchList.forEach((watcher) => watcher())

        if (!value || !isArray(value)) {
          return
        }

        value.forEach((item) => {
          const injected = injector(deepClone(item))

          const watcher = isFunction(injected.watch)
            ? injected.watch
            : isArray(injected.watch)
            ? injected.watch.map((sw) => (isFunction(sw) ? sw : () => sw))
            : () => injected.watch

          watchList.push(
            watch(
              watcher,
              () => {
                injected.actions?.forEach((action) => {
                  if (action.condition === undefined || !!action.condition) {
                    if (isFunction(action.handler)) {
                      if (action.timeout) {
                        setTimeout(() => {
                          action.handler()
                        }, action.timeout)
                      } else {
                        action.handler()
                      }
                    }
                  }
                })
              },
              {
                deep: injected.deep,
                immediate: injected.immediate,
              },
            ),
          )
        })
      },
      { deep: false, immediate: true },
    )

    onBeforeMount(() => {
      watchList.forEach((watcher) => watcher())
      watchList.length = 0
    })
    //#endregion

    return () =>
      isArrayRoot.value
        ? roots.value.map((field) => h(resolveComponent('JNode'), { field }))
        : h(resolveComponent('JNode'), { field: roots })
  },
})
