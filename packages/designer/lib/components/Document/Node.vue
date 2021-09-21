<script lang="ts" setup>
import { useDocument, useDocumentNode } from './mixins'
import Dragzone from './Dragzone.vue'
import { reactive } from 'vue'
import NodeBody from './NodeBody.vue'
import NodeChildren from './NodeChildren.vue'

const props = defineProps({
  node: { type: Object, required: true },
  parent: { type: Object, required: false },
  depth: { type: Number, default: 0 },
  index: { type: Number, default: 0 },
})

const context: any = useDocument()

const { text, isLeaf, isOpen, onToggleOpen }: any = useDocumentNode({
  node: reactive(props.node),
  context,
})

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
      <div class="relative py-1 leading-tight" draggable="true" @dragstart="onNodeDragstart">
        <span>{{ text }}</span>
        <span v-if="!isLeaf" @click="onToggleOpen">[{{ isOpen ? '-' : '+' }}]</span>
      </div>
    </NodeBody>

    <NodeBody :depth="depth" class="absolute bottom-0 w-full z-1">
      <Dragzone @droped="onNodeDroped" />
    </NodeBody>

    <div v-if="isOpen" class="relative">
      <NodeChildren :depth="depth + 1" />
    </div>
  </div>
</template>

<style scoped>
.z-1 {
  z-index: 1;
}
</style>
