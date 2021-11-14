<script setup lang="ts">
import { ref } from 'vue'

defineProps({ depth: { type: Number, default: 0 }, node: Object })

const draggingOver = ref(false)

const onDragover = () => {
  draggingOver.value = true
}

const onDragleave = () => {
  draggingOver.value = false
}
</script>

<!-- <script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'NodeBody',
})
</script> -->

<template>
  <div class="flex flex-row">
    <div
      v-for="i in depth"
      :key="i"
      class="w-8"
      :class="{ in: draggingOver && i === depth }"
      @dragenter="onDragover"
      @dragleave="onDragleave"
    ></div>
    <div class="flex-1 flex">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.in {
  background-color: red;
}
</style>
