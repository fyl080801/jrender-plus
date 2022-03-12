<script lang="ts" setup>
import { assignObject, isPromise } from '../utils/helper'
import { useJRender, useScope } from '../utils/mixins'
import { pipeline } from '../utils/pipeline'
import { getProxyDefine, injectProxy } from '../utils/proxy'
import JSlot from './JSlot'

const props = defineProps({
  field: Object,
  scope: Object,
  temp: Object,
  context: Object,
})

const { services, slots } = useJRender()

const { scope } = useScope(assignObject(props.scope || {}, props.temp))

const sharedServices = {
  context: props.context,
  scope,
  props,
  render: () => {
    render(assignObject(getProxyDefine(toRaw(props.field))))
  },
}

const injector = injectProxy({
  context: props.context,
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
    ...services.beforeBindHandlers.map((item) => item.handler),
    () => async (field, next) => {
      let nexted

      if (field?.component === 'slot') {
        nexted = next({
          component: markRaw(JSlot),
          props: {
            renderSlot: () => {
              const renderer = slots[field.name || 'default']
              return renderer && renderer(field.props || {})
            },
          },
        })
      } else {
        nexted = next(field)
      }

      if (isPromise(nexted)) {
        await nexted
      }
    },
    () => async (field, next) => {
      renderField.value = injector(getProxyDefine(field))
      const nexted = next(renderField.value)
      if (isPromise(nexted)) {
        await nexted
      }
    },
    ...services.bindHandlers.map((item) => item.handler),
    () => async (field, next) => {
      renderField.value = field
      const nexted = next(renderField.value)
      if (isPromise(nexted)) {
        await nexted
      }
    },
  ].map((provider) => provider(sharedServices)),
)

const getTemplateScope = (s) => {
  return Object.keys(s || {}).length ? s : undefined
}

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
import { computed, defineComponent, ref, markRaw, toRaw, watch } from 'vue'

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
    <template v-for="slot in renderSlots" #[slot.name]="templateScope">
      <JNode
        v-for="child in slot.children"
        :field="child"
        :scope="scope"
        :temp="getTemplateScope(templateScope)"
        :context="context"
      />
    </template>
  </component>
</template>
