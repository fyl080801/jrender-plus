import { JRender, JNode, renderNode } from './components'
import { Plugin, h } from 'vue'

const plugin: Plugin = {
  install: (app) => {
    app.component(JRender.name, JRender)
  },
  ...JRender,
}

export { JRender, JNode, renderNode }
export { useRootRender } from './utils/mixins'
export { useGlobalRender } from './utils/service'
export { getProxyDefine, injectProxy } from './utils/proxy'
export * from './utils/helper'

export default plugin
