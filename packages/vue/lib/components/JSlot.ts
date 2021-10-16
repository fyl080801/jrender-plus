import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    renderSlot: { type: Function, default: () => {} },
  },
  setup(props) {
    return props.renderSlot
  },
})
