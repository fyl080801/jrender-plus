<script lang="ts" setup>
import { ref } from 'vue'
import { useDocument } from './mixins'
const emit = defineEmits(['droped'])
const { state } = useDocument()
const draggingOver = ref(false)
const onDragover = (event) => {
  event.preventDefault()
  draggingOver.value = true
  const onDragleave = () => {
    draggingOver.value = false
    event.target.removeEventListener('dragleave', onDragleave)
  }
  event.target.addEventListener('dragleave', onDragleave, false)
}
const onDrop = () => {
  emit('droped')
}
</script>

<template>
  <div
    v-if="state.dragging"
    class="w-full h-4 -my-2 bg-blue-900 bg-opacity-10"
    :class="{ over: draggingOver }"
    @dragenter="onDragover"
    @dragover="(event) => event.preventDefault()"
    @drop="onDrop"
  >
    <slot />
  </div>
</template>

<style scope>
.over {
  background: rgba(3, 101, 248, 0.344) !important;
}
</style>
