<script setup lang="ts">
import { watch, reactive } from 'vue'
import Dragzone from './Dragzone.vue'
import { useTreeNode, useTreeRoot } from './mixins'
import TreeNodeChildren from './TreeNodeChildren.vue'

const props = defineProps({ data: { type: Array, default: () => [] }, options: Object })

const emit = defineEmits(['node-click'])

watch(
  () => props.data,
  (value) => {
    node.children = value
  },
)

const context = useTreeRoot({
  state: {
    dragging: false,
  },
  methods: {
    generateId: props.options?.generateId,
    isLeaf: props.options?.isLeaf,
    getNodeText: props.options?.getNodeText,
  },
  emit,
})

const node = reactive({
  children: props.data,
})

const { children } = useTreeNode({
  node,
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
