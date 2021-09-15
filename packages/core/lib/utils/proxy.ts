import { isArray, isDom, isFunction, isObject } from './helper'

const PROXY = '__j_proxy'
const RAW = '__j_raw'

export const isInjectedProxy = (target) => {
  return target[PROXY]
}

export const getProxyDefine = (target) => {
  return isInjectedProxy(target) ? target[RAW] : target
}

export const injectProxy = (services) => {
  const { context = {}, proxy = [] } = services

  const handlers = [...proxy]

  const inject = (input) => {
    if (!isObject(input) && !isArray(input)) {
      return input
    }

    if (isInjectedProxy(input)) {
      return input
    }

    return new Proxy(input, {
      get: (target, p, receiver) => {
        if (p === PROXY) {
          return true
        }

        if (p === RAW) {
          return target
        }

        const value = Reflect.get(target, p, receiver)

        for (const f of handlers) {
          const handler = f(value)

          if (handler && isFunction(handler)) {
            return inject(handler(context))
          }
        }

        return (!isDom(value) && inject(value)) || value
      },
    })
  }

  return inject
}
