<script lang="ts" setup>
import { assignObject } from '../utils/helper'
import { useJRender, useScope } from '../utils/mixins'
import { pipeline } from '../utils/pipeline'
import { getProxyDefine, injectProxy } from '../utils/proxy'
import JSlot from './JSlot'

const props = defineProps({
  field: { type: Object, required: true },
  scope: Object,
})

const { context, services, slots } = useJRender()

const { scope } = useScope(props.scope || {})

const sharedServices = { context, scope }

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

if (props.field) {
  const beforeRenders = [
    ...services.beforeRenderHandlers,
    () => (field, next) => {
      if (field?.component === 'slot') {
        return next({
          component: markRaw(JSlot),
          props: { renderSlot: () => slots[field.name || 'default'](field.props || {}) },
        })
      }
      next(field)
    },
    () => (field, next) => {
      renderField.value = injector(getProxyDefine(field))
      next(renderField.value)
    },
  ].map((provider) => provider(sharedServices))

  pipeline(...beforeRenders)(assignObject(toRaw(props.field)))
}
</script>

<script lang="ts">
import { computed, defineComponent, ref, toRaw, markRaw } from 'vue'

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
