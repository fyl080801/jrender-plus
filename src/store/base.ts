import { reactive, shallowReadonly } from 'vue'
import { isFunction } from '@jrender-plus/core'

const dispatchProp = '__s_dispatch'

const createState = (init) => {
  return isFunction(init) ? () => reactive(init()) : reactive(init)
}

const pipeline = (...funcs) => {
  return (scope) => {
    let index = -1

    const dispatch = (i) => {
      if (index >= i) return Promise.reject(new Error('next 执行了多次'))

      index = i

      const next = () => {
        return dispatch(i + 1)
      }

      let currentFn = i >= funcs.length ? null : funcs[i]

      if (!currentFn) return Promise.resolve()

      return Promise.resolve(currentFn(scope, next))
    }

    return dispatch(0)
  }
}

export const action = (...funcs) => {
  const dispatch = [...funcs].slice(0, funcs.length - 1)

  return new Proxy(funcs[funcs.length - 1], {
    apply: (t, thisArg, argArray) => {
      return Reflect.apply(t, thisArg, argArray)
    },
    get: (t, prop, receiver) => {
      if (prop === dispatchProp) {
        return dispatch
      }

      return Reflect.get(t, prop, receiver)
    },
  })
}

export const store = <T, V>(init: T, factory, globals?) => {
  const state = createState(init)

  return () => {
    const actions = Object.keys(factory).reduce((target, key) => {
      const builder = factory[key]

      const dispatch = [...(globals || []), ...(builder[dispatchProp] || [])]
        .map((d) => {
          if (!isFunction(d)) {
            return null
          }

          const middleware = d(state, target)

          return isFunction(middleware) ? middleware : null
        })
        .filter((item) => item)

      target[key] = new Proxy(builder(state, target), {
        apply: (t, thisArg, argArray) => {
          let result

          pipeline(...dispatch, (_, next) => {
            result = Reflect.apply(t, thisArg, argArray)
            next()
          })(argArray)

          return result
        },
      })
      return target
    }, {})

    return shallowReadonly({ state, ...(actions as V) })
  }
}
