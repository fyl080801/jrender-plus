import { assignObject } from './helper'
import { isArray, isDom, isFunction, isObject } from './helper'
import { BindProxyProvider } from './types'

const PROXY = '__j_proxy'
const RAW = '__j_raw'

export const isInjectedProxy = (target) => {
  return target !== undefined && target !== null && target[PROXY]
}

export const getProxyDefine = (target) => {
  return isInjectedProxy(target) ? target[RAW] : target
}

export const injectProxy = (services) => {
  const { context = {}, scope = {}, proxy = [] } = services

  const handlers = [...proxy]

  const inject = (input) => {
    if (!isObject(input) && !isArray(input)) {
      return input
    }

    if (isInjectedProxy(input)) {
      return input
    }

    return new Proxy(input, {
      get: (target, p) => {
        if (p === PROXY) {
          return true
        }

        if (p === RAW) {
          return input
        }

        const value = target[p]

        for (const f of handlers) {
          const handler = f(value)

          if (handler && isFunction(handler)) {
            return inject(getProxyDefine(handler(assignObject(context, scope || {}))))
          }
        }

        return (isDom(value) && value) || inject(getProxyDefine(value))
      },
    })
  }

  return inject
}

export const compute: BindProxyProvider = ({ functional }) => {
  const computeMatch = /^\$:/g

  return (value) => {
    const handler = (context) => {
      try {
        const keys = Object.keys(context)
        const funcKeys = Object.keys(functional)
        return new Function(...[...keys, ...funcKeys], `return ${value.replace(computeMatch, '')}`)(
          ...[...keys.map((key) => context[key]), ...funcKeys.map((key) => functional[key])],
        )
      } catch {
        //
      }
    }

    return typeof value === 'string' && computeMatch.test(value) && handler
  }
}
