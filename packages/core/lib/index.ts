import { JRender } from './components'
import { Plugin } from 'vue'

export { JRender }

const plugin: Plugin = {
  install: (app) => {
    app.component(JRender.name, JRender)
  },
  ...JRender,
}

export default plugin
