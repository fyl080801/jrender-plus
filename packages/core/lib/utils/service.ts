import { assignArray, assignObject, isArray, isFunction, isObject, uuid } from './helper'
import { rawData, GET, SET, REF } from './inner'
import { compute } from './proxy'
import { Setup, SetupHandle } from './types'

const sortHandlers = (handlers) => {
  const maps = handlers.reduce((target, item) => {
    target[item.name] = item
    return target
  }, {})
  const dependencies = handlers.reduce((target, item) => {
    const dts = handlers.filter((dt) => dt.dependent?.indexOf(item.name) >= 0)
    target[item.name] = [...item.dependencies, ...dts.map((dt) => dt.name)]
    return target
  }, {})
  const used = new Set()
  const result = []

  let keys = Object.keys(dependencies)
  let items
  let length

  do {
    length = keys.length
    items = []
    keys = keys.filter((k) => {
      if (!dependencies[k].every(Set.prototype.has, used)) {
        return true
      }
      items.push(k)
    })
    result.push(...items)
    items.forEach(Set.prototype.add, used)
  } while (keys.length && keys.length !== length)

  result.push(...keys)

  return result.map((key) => maps[key])
}

export const createServiceProvider = () => {
  const services = {
    components: {},
    functional: {},
    beforeBindHandlers: [],
    bindHandlers: [],
    proxy: [],
    dataSource: {},
  }

  const setting: Setup = {
    addComponent: (name, type) => {
      services.components[name] = type
    },
    addFunction: (name, fx) => {
      if (isFunction(fx)) {
        services.functional[name] = fx
      }
    },
    onBeforeBind: (handler) => {
      const hook = { name: `BR_${uuid(5)}`, dependent: [], dependencies: [], handler }

      if (isFunction(handler)) {
        services.beforeBindHandlers.push(hook)
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
        dependent: (name) => {
          if (hook.dependent.indexOf(name) < 0) {
            hook.dependent.push(name)
          }
          return instance
        },
      }

      return instance
    },
    onBind: (handler) => {
      const hook = { name: `R_${uuid(5)}`, dependent: [], dependencies: [], handler }

      if (isFunction(handler)) {
        services.bindHandlers.push(hook)
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
        dependent: (name) => {
          if (hook.dependent.indexOf(name) < 0) {
            hook.dependent.push(name)
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
    setup: (onSetup: SetupHandle) => {
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
    beforeBindHandlers: [],
    bindHandlers: [],
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

  merged.beforeBindHandlers = sortHandlers(merged.beforeBindHandlers)

  merged.bindHandlers = sortHandlers(merged.bindHandlers)

  return merged
}

export const globalServiceProvider = createServiceProvider()

export const useGlobalRender = (setting: SetupHandle) => {
  globalServiceProvider.setup(setting)
}

export const defineRenderSetup = (setup: SetupHandle) => {
  return setup
}
