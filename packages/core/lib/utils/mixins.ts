import { inject, provide } from 'vue'
import { createServiceProvider } from './service'

const serviceToken = Symbol('serviceToken')

const setupToken = Symbol('setupToken')

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
