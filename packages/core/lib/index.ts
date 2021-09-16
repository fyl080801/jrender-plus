import { JRender } from './components'
import { Plugin } from 'vue'

const plugin: Plugin = {
  install: (app) => {
    app.component(JRender.name, JRender)
  },
  ...JRender,
}

export { JRender }
export { useRootRender } from './utils/mixins'
export { useGlobalRender } from './utils/service'

export default plugin
