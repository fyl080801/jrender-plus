<script lang="ts" setup>
import { JRender } from '@jrender-plus/core'
import { reactive, ref } from 'vue'
import { Document } from '@/components'

const model: any = reactive({})

const configs = reactive({
  model: {},
  dataSource: {
    rules: {
      props: {
        text: [{ required: true, message: '不可为空' }],
      },
    },
  },
  fields: [
    {
      component: 'h1',
      props: { style: { fontSize: '18px' } },
      children: [{ component: 'slot', name: 'header' }],
    },
    { component: 'p', rel: true, props: { innerText: 'sssss' } },
    {
      component: 'div',
      children: [
        {
          component: 'input',
          props: {
            placeholder: 'input value',
            value: '$:model.text',
            onInput: '$:(e)=>model.text=e.target.value',
          },
        },
        {
          component: 'p',
          props: { innerText: '$:model.text' },
        },
      ],
    },
    { component: 'slot' },
    {
      component: 'el-form',
      props: {
        labelWidth: '120px',
        model: '$:model',
      },
      children: [
        {
          component: 'el-input',
          model: 'model.text',
          formItem: {
            label: 'aa',
            prop: 'text',
            rules: '$:rules.text',
          },
          props: {
            style: { width: 'auto' },
          },
          children: [{ component: 'span', slot: 'append', props: { innerText: 'end' } }],
        },
      ],
    },
  ],
})

const data = ref([
  {
    text: 'aaaa',
    children: [
      { text: '啊啊啊啊', isLeaf: true },
      { text: 'aaa-2', children: [{ text: 'xxxx', isLeaf: true }] },
      { text: 'aaa-3' },
      { text: 'aaa-4', isLeaf: true },
    ],
  },
  {
    text: 'bbb',
    children: [
      { text: 'bbb-1', isLeaf: true },
      { text: 'bbb-2', isLeaf: true },
    ],
  },
])

const onSetup = ({ onBeforeRender }) => {
  // model
  onBeforeRender(() => (field, next) => {
    if (typeof field.model === 'string') {
      const paths = field.model.split('.')
      const path = [...paths].splice(1, paths.length)

      field.props ||= {}
      field.props.modelValue = `$:${field.model}`
      field.props['onUpdate:modelValue'] = `$:(e) => SET(${paths[0]}, '${path.join('.')}', e)`

      delete field.model
    }
    next(field)
  })

  // 外套表单项
  onBeforeRender(() => (field, next) => {
    if (!field.formItem) {
      return next(field)
    }

    const formItem = field.formItem

    delete field.formItem

    return next({ component: 'el-form-item', props: formItem, children: [field] })
  })

  // 渲染控制
  onBeforeRender(() => (field, next) => {
    if (field.rel !== true) {
      return next(field)
    }

    let counter = 3

    next({ component: 'span', props: { innerText: `Loading (${counter + 1})` } })

    const timer = setInterval(() => {
      if (counter > 0) {
        next({ component: 'span', props: { innerText: `Loading (${counter})` } })
        counter--
      } else {
        clearInterval(timer)
        next(field)
      }
    }, 1000)
  })
}
</script>

<template>
  <JRender
    :fields="configs.fields"
    :data-source="configs.dataSource"
    v-model="model"
    @setup="onSetup"
  >
    <span>slot content</span>
    <template v-slot:header>
      <span>header content</span>
    </template>
  </JRender>
  <Document :data="data" />
  <!-- <p>{{}}</p> -->
</template>
