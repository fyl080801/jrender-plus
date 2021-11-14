<script setup lang="ts">
import Dragzone from './Dragzone.vue'
import { useTree, useTreeNode } from './mixins'
import TreeNode from './TreeNode.vue'
import { getNodeId } from './tree'
import NodeBody from './NodeBody.vue'

defineProps({
  depth: { type: Number, default: 0 },
})

const context = useTree()

const { node, children } = useTreeNode()

const onNodeDroped = () => {
  context.state.changes.push({
    from: context.state.from,
    to: { node, index: 0 },
  })
}
</script>

<template>
  <div class="flex flex-col">
    <NodeBody :depth="depth" class="absolute w-full z-1">
      <Dragzone @droped="onNodeDroped" />
    </NodeBody>
    <div class="flex flex-col">
      <TreeNode
        v-for="(child, index) in children"
        :key="getNodeId(child)"
        :node="child"
        :parent="node"
        :depth="depth"
        :index="index"
      />
    </div>
  </div>
</template>

<style scoped>
.z-1 {
  z-index: 1;
}
</style>
