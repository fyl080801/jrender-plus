import { assignArray, assignObject, isArray, isFunction, isObject } from './helper'
import { rawData, compute, GET, SET, REF } from './inner'

export const createServiceProvider = () => {
  const services = {
    components: {},
    functional: {},
    beforeRenderHandlers: [],
    renderHandlers: [],
    proxy: [],
    dataSource: {},
  }

  const setting = {
    addComponent: (name, type) => {
      services.components[name] = type
    },
    addFunction: (name, fx) => {
      if (isFunction(fx)) {
        services.functional[name] = fx
      }
    },
    onBeforeRender: (handler) => {
      const hook = { name: '', dependencies: [], handler }

      if (isFunction(handler)) {
        services.beforeRenderHandlers.push(hook)
      }

      const instance = {
        name: (name) => {
          hook.name = name
          return instance
        },
        depend: (name) => {
          if (hook.dependencies.indexOf(name) < 0) {
            hook.dependencies.push(name)
          }
          return instance
        },
      }

      return instance
    },
    onRender: (handler) => {
      const hook = { name: '', dependencies: [], handler }

      if (isFunction(handler)) {
        services.renderHandlers.push(hook)
      }

      const instance = {
        name: (name) => {
          hook.name = name
          return instance
        },
        depend: (name) => {
          if (hook.dependencies.indexOf(name) < 0) {
            hook.dependencies.push(name)
          }
          return instance
        },
      }

      return instance
    },
    addProxy: (handler) => {
      if (isFunction(handler)) {
        services.proxy.push(handler)
      }
    },
    addDataSource(type, provider) {
      if (type && isFunction(provider)) {
        services.dataSource[type] = provider
      }
    },
  }

  const instance = {
    setup: (onSetup) => {
      onSetup(setting)
      return instance
    },
    getSetting() {
      return setting
    },
    getServices() {
      return services
    },
  }

  return instance
}

export const mergeServices = (...services) => {
  const merged: any = {
    functional: { SET, GET, REF },
    proxy: [compute],
    beforeRenderHandlers: [],
    renderHandlers: [],
    dataSource: {
      default: rawData,
    },
  }

  services.forEach((service) => {
    Object.keys(service || {}).forEach((key) => {
      if (isObject(service[key])) {
        merged[key] ||= {}
        merged[key] = assignObject(merged[key], service[key])
      } else if (isArray(service[key])) {
        merged[key] ||= []
        merged[key] = assignArray(merged[key], service[key])
      }
    })
  })

  return merged
}

export const globalServiceProvider = createServiceProvider()

export const useGlobalRender = (setting) => {
  globalServiceProvider.setup(setting)
}
