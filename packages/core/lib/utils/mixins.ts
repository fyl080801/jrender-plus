import { inject, provide, onMounted, onBeforeUnmount, watch } from 'vue'
import { deepClone, isArray, isFunction } from './helper'
import { createServiceProvider, globalServiceProvider, mergeServices } from './service'
import { SetupHandle } from './types'

const serviceToken = Symbol('serviceToken')

const setupToken = Symbol('setupToken')

export const useJRender = (props?) => {
  if (props) {
    provide(serviceToken, props)

    return props
  } else {
    return inject(serviceToken, {})
  }
}

export const useRootRender = (setup?: SetupHandle) => {
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

  const createWatchList = () => {
    releaseWatchList()

    if (!props.listeners || !isArray(props.listeners)) {
      return
    }

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
  }

  const releaseWatchList = () => {
    if (watchList) {
      watchList.forEach((watcher) => watcher())
      watchList.length = 0
    }
  }

  watch(
    [() => props.listeners, () => props.modelValue, () => props.dataSource, () => props.fields],
    () => {
      createWatchList()
    },
    { deep: false },
  )

  onMounted(() => {
    createWatchList()
  })

  onBeforeUnmount(() => {
    releaseWatchList()
  })
}

export const useServices = ({ emit }) => {
  const provider = createServiceProvider()

  emit('setup', provider.getSetting())

  const rootServices = useRootRender()

  return mergeServices(globalServiceProvider.getServices(), rootServices, provider.getServices())
}
