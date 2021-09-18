import { inject, provide, reactive, isReactive } from 'vue'
import { assignObject } from './helper'
import { createServiceProvider } from './service'

const serviceToken = Symbol('serviceToken')

const setupToken = Symbol('setupToken')

const scopeParentToken = Symbol('scopeParentToken')

export const useJRender = (props?) => {
  if (props) {
    const { context, slots, mergedServices } = props

    provide(serviceToken, { context, slots, mergedServices })

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

export const useScope = (scope) => {
  const { scope: parent } = inject(scopeParentToken, reactive({ scope: {} }))

  const merged = reactive({
    scope: assignObject(parent, scope),
  })

  provide(scopeParentToken, merged)

  return merged
}
