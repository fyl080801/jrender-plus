import { inject, provide, reactive, nextTick, onBeforeUnmount, watch } from 'vue'
import { assignObject, deepClone, isArray, isFunction } from './helper'
import { createServiceProvider, globalServiceProvider, mergeServices } from './service'

const serviceToken = Symbol('serviceToken')

const setupToken = Symbol('setupToken')

const scopeParentToken = Symbol('scopeParentToken')

export const useJRender = (props?) => {
  if (props) {
    // const { context, render, services } = props

    provide(serviceToken, props)

    return props
  } else {
    return inject(serviceToken)
  }
}

export const useRootRender = (setup?) => {
  const provider = createServiceProvider()

  if (setup) {
    provider.setup(setup)
    provide(setupToken, provider.getServices())
  } else {
    return inject(setupToken, provider.getServices())
  }
}

export const useListener = (props, { injector }) => {
  const watchList = []
  watch(
    [() => props.listeners, () => props.modelValue, () => props.dataSource, () => props.fields],
    () => {
      watchList.forEach((watcher) => watcher())
      watchList.length = 0

      if (!props.listeners || !isArray(props.listeners)) {
        return
      }

      nextTick(() => {
        props.listeners?.forEach((item) => {
          const injected = injector(deepClone(item))

          const watcher = isFunction(injected.watch)
            ? injected.watch
            : isArray(injected.watch)
            ? injected.watch.map((sw, index) => (isFunction(sw) ? sw : () => injected.watch[index]))
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
      })
    },
    { deep: false, immediate: true },
  )

  onBeforeUnmount(() => {
    watchList.forEach((watcher) => watcher())
    watchList.length = 0
  })
}

export const useServices = ({ emit }) => {
  const provider = createServiceProvider()

  emit('setup', provider.getSetting())

  const rootServices = useRootRender()

  return mergeServices(globalServiceProvider.getServices(), rootServices, provider.getServices())
}

export const useScope = (scope) => {
  const { scope: parent } = inject(scopeParentToken, reactive({ scope: {} }))

  const merged = reactive({
    scope: assignObject(parent, scope),
  })

  provide(scopeParentToken, merged)

  return merged
}
