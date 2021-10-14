import { JRender, JNode } from './components'
import { Plugin } from 'vue'

const plugin: Plugin = {
  install: (app) => {
    app.component(JRender.name, JRender)
  },
  ...JRender,
}

export { JRender, JNode }

export default plugin
