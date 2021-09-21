<script lang="ts">
import { defineComponent } from 'vue'
import Dragzone from './Dragzone.vue'
import { useDocumentNode, useDocumentRoot } from './mixins'
import NodeChildren from './NodeChildren.vue'

export default defineComponent({
  props: { data: { type: Array, default: () => [] }, configs: Object },
  components: { Dragzone, NodeChildren },
  setup(props) {
    const context = useDocumentRoot({
      state: {
        dragging: false,
      },
      methods: {
        generateId: props.configs?.generateId,
        isLeaf: props.configs?.isLeaf,
        getNodeText: props.configs?.getNodeText,
      },
    })
    const { children }: any = useDocumentNode({
      node: { children: props.data },
      context,
    })
    return {
      children,
    }
  },
})
</script>

<template>
  <div class="relative flex flex-col">
    <template v-if="children?.length > 0">
      <NodeChildren />
    </template>
    <Dragzone v-else>add node</Dragzone>
  </div>
</template>
