<script lang="ts" setup>
import { reactive, watch } from 'vue'
import { useRootRender } from '@jrender-plus/core'

const map = [
  {
    component: 'div',
    id: 1,
    props: {
      style: {
        border: '1px solid red',
      },
    },
  },
  {
    component: 'p',
    id: 2,
    parentId: 1,
    props: {
      innerText: 'aaaa',
    },
  },
  {
    component: 'div',
    id: 4,
    parentId: 1,
    props: {
      style: {
        border: '1px solid blue',
      },
    },
  },
  {
    component: 'p',
    id: 3,
    parentId: 4,
    props: {
      innerText: '$:model.text',
    },
  },
  {
    component: 'input',
    id: 6,
    parentId: 4,
    props: {
      value: '$:model.text',
      onInput: '$:(e)=>model.text=e.target.value',
    },
  },
]

const configs = reactive({
  model: {},
  datasource: {},
  listeners: [],
  fields: map.filter((item) => !item.parentId),
})

useRootRender(({ onBeforeRender }) => {
  onBeforeRender(({ props }) => {
    let watcher = null

    return (field, next) => {
      watcher && watcher()

      field.children = map.filter((item) => item.parentId === field.id)
      props.field.items = field.children?.map((child) => child.id)

      watcher = watch(
        () => props.field,
        () => {
          next(field)
        },
        { deep: true },
      )

      next(field)
    }
  })
    .name('list_to_tree')
    .depend('fake')
})
</script>

<template>
  <div>
    <JRender
      v-model="configs.model"
      :fields="configs.fields"
      :listeners="configs.listeners"
      :data-source="configs.datasource"
    >
    </JRender>
  </div>
</template>
