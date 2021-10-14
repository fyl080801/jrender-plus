<script lang="ts" setup>
import { JRender } from '@jrender-plus/vue'
import { reactive } from 'vue'

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
  />
  <!-- <p>{{}}</p> -->
</template>
