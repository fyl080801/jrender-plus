<script setup lang="ts">
import Dragzone from './Dragzone.vue'
import { useTreeNode, useTreeRoot } from './mixins'
import TreeNodeChildren from './TreeNodeChildren.vue'

const props = defineProps({ data: { type: Array, default: () => [] }, options: Object })

const context = useTreeRoot({
  state: {
    dragging: false,
  },
  methods: {
    generateId: props.options?.generateId,
    isLeaf: props.options?.isLeaf,
    getNodeText: props.options?.getNodeText,
  },
})

const { children } = useTreeNode({
  node: { children: props.data },
  context,
})
</script>

<template>
  <div class="relative flex flex-col">
    <template v-if="children?.length > 0">
      <TreeNodeChildren />
    </template>
    <Dragzone v-else>add node</Dragzone>
  </div>
</template>
