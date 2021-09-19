<script lang="ts" setup>
import Dragzone from './Dragzone.vue'
import { useDocumentNode, useDocumentRoot } from './mixins'
import NodeChildren from './NodeChildren.vue'
const props = defineProps({ data: { type: Array, default: () => [] }, options: Object })
const context = useDocumentRoot({
  state: {
    dragging: false,
  },
  methods: {
    generateId: props.options?.generateId,
    isLeaf: props.options?.isLeaf,
    getNodeText: props.options?.getNodeText,
  },
})
const { children }: any = useDocumentNode({
  node: { children: props.data },
  context,
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
