<script lang="ts" setup>
import { useSlots } from 'vue'
import { isArray, isFunction } from '../utils/helper'
import { useJRender, useListener, useScope, useServices } from '../utils/mixins'
import { injectProxy } from '../utils/proxy'
import JNode from './JNode.vue'

const props = defineProps({
  modelValue: { type: Object, default: () => ({}) },
  fields: { type: [Array, Object], default: () => [] },
  listeners: { type: Array, default: () => [] },
  dataSource: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['update:modelValue', 'setup'])

const services = useServices({ emit })

const context = reactive({
  model: props.modelValue,
  refs: {},
})

const isArrayRoot = computed(() => {
  return isArray(props.fields)
})

const injector = injectProxy({
  context,
  proxy: services.proxy.map((p) => p({ functional: services.functional })),
})

useJRender({
  context,
  services,
  props,
  slots: useSlots(),
})

useScope({})

// dataSource
watch(
  () => props.dataSource,
  (value, origin) => {
    Object.keys(origin || {}).forEach((key) => {
      delete context[key]
    })

    Object.keys(value || {}).forEach((key) => {
      const info = value[key]
      const provider = services.dataSource[info.type || 'default']

      if (['model', 'scope', 'arguments', 'refs'].indexOf(key) < 0 && isFunction(provider)) {
        context[key] = provider(() => injector(info.props))
      }
    })
  },
  { immediate: true },
)

watch(
  () => context.model,
  (value) => {
    emit('update:modelValue', value)
  },
)

useListener(props, { injector })
</script>

<script lang="ts">
import { watch, computed, defineProps, defineComponent, reactive } from 'vue'

export default defineComponent({ name: 'JRender' })
</script>

<template>
  <template v-if="isArrayRoot">
    <JNode :field="field" v-for="field in fields" />
  </template>
  <JNode v-else :field="fields" />
</template>
