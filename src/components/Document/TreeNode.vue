<script setup lang="ts">
import { useTree, useTreeNode } from './mixins'
import Dragzone from './Dragzone.vue'
import NodeBody from './NodeBody.vue'
import TreeNodeChildren from './TreeNodeChildren.vue'

const props = defineProps({
  node: { type: Object, required: true },
  parent: { type: Object, required: false },
  depth: { type: Number, default: 0 },
  index: { type: Number, default: 0 },
})

const context = useTree()

const { text, isLeaf, isOpen, onToggleOpen } = useTreeNode({
  node: props.node,
  context,
})

const onBodyClick = () => {
  context.emit('node-click', props.node)
}

const onNodeDragstart = (event) => {
  context.state.dragging = true
  const cloned = event.target.cloneNode(true)
  cloned.style.display = 'none'
  document.body.appendChild(cloned)
  event.dataTransfer.setDragImage(cloned, 0, 0)

  const onDragend = () => {
    context.state.dragging = false
    cloned.remove()
    event.target.removeEventListener('dragend', onDragend)
  }

  event.target.addEventListener('dragend', onDragend, false)

  //
  context.state.from = { node: props.parent, index: props.index }
}

const onNodeDroped = () => {
  context.state.changes.push({
    from: context.state.from,
    to: { node: props.parent, index: props.index + 1 },
  })
}
</script>

<template>
  <div class="relative">
    <NodeBody
      :depth="depth"
      :node="node"
      class="border border-transparent border-solid hover:border-blue-500"
    >
      <!-- 展开 -->
      <div class="w-8">
        <span v-if="!isLeaf" @click="onToggleOpen">[{{ isOpen ? '-' : '+' }}]</span>
      </div>
      <div
        class="flex-1 relative py-2"
        draggable="true"
        @dragstart="onNodeDragstart"
        @click="onBodyClick"
      >
        <span class="leading-none">{{ text }}</span>
      </div>
    </NodeBody>

    <NodeBody :depth="depth" class="absolute bottom-0 w-full z-1">
      <Dragzone @droped="onNodeDroped" />
    </NodeBody>

    <div v-if="isOpen" class="relative">
      <TreeNodeChildren :depth="depth + 1" />
    </div>
  </div>
</template>

<style scoped>
.z-1 {
  z-index: 1;
}
</style>
