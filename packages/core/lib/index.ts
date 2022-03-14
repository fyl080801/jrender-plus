import { JRender, JNode, JSlot } from './components'
import { Plugin } from 'vue'

const plugin: Plugin = {
  install: (app) => {
    app.component(JRender.name, JRender)
  },
  ...JRender,
}

export { JRender, JNode, JSlot }
export { useRootRender } from './utils/mixins'
export { useGlobalRender, defineRenderSetup } from './utils/service'
export * from './utils/proxy'
export * from './utils/helper'
export * from './utils/types'
export default plugin
