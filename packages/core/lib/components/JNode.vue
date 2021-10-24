<script lang="ts" setup>
import { assignObject } from '../utils/helper'
import { useJRender, useScope } from '../utils/mixins'
import { pipeline } from '../utils/pipeline'
import { getProxyDefine, injectProxy } from '../utils/proxy'
import JSlot from './JSlot'

const props = defineProps({
  field: Object,
  scope: Object,
})

const { context, services, slots } = useJRender()

const { scope } = useScope(props.scope || {})

const sharedServices = { context, scope, props }

const injector = injectProxy({
  context,
  scope,
  proxy: services.proxy.map((p) => p({ functional: services.functional })),
})

const renderField = ref()

const renderSlots = computed<any>(() => {
  if (!renderField.value) {
    return []
  }

  const result =
    Object.entries(
      renderField.value.children?.reduce((target, child) => {
        const slotName = child?.slot || 'default'
        target[slotName] ||= []
        target[slotName].push(child)
        return target
      }, {}) || {},
    ) || []

  return result.map((item) => ({ name: item[0], children: item[1] }))
})

const render = pipeline(
  ...[
    ...services.beforeRenderHandlers.map((item) => item.handler),
    () => (field, next) => {
      if (field?.component === 'slot') {
        return next({
          component: markRaw(JSlot),
          props: {
            renderSlot: () => {
              const renderer = slots[field.name || 'default']
              return renderer && renderer(field.props || {})
            },
          },
        })
      }
      next(field)
    },
    () => (field, next) => {
      renderField.value = injector(getProxyDefine(field))
      next(renderField.value)
    },
    ...services.renderHandlers.map((item) => item.handler),
    () => (field, next) => {
      renderField.value = field
      next(renderField.value)
    },
  ].map((provider) => provider(sharedServices)),
)

watch(
  () => props.field,
  () => {
    if (props.field) {
      render(assignObject(getProxyDefine(toRaw(props.field))))
    }
  },
  { immediate: true },
)
</script>

<script lang="ts">
import { computed, defineComponent, ref, toRaw, markRaw, watch } from 'vue'

export default defineComponent({
  name: 'JNode',
})
</script>

<template>
  <component
    v-if="renderField && renderField.component"
    :is="services.components[renderField.component] || renderField.component"
    v-bind="renderField.props"
  >
    <template #[slot.name] v-for="slot in renderSlots">
      <JNode v-for="child in slot.children" :field="child" :scope="scope" />
    </template>
  </component>
</template>
