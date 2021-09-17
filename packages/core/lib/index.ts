import { JRender, JNode } from './components'
import { Plugin } from 'vue'

const plugin: Plugin = {
  install: (app) => {
    app.component(JRender.name, JRender)
  },
  ...JRender,
}

export { JRender, JNode }
export { useRootRender } from './utils/mixins'
export { useGlobalRender } from './utils/service'
export * from './utils/helper'

export default plugin
