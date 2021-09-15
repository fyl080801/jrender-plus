<script lang="ts" setup>
import { JRender } from '@jrender-plus/core'
import { reactive } from 'vue'

const configs = reactive({
  model: {},
  fields: [
    {
      component: 'div',
      props: { style: { marginBottom: '20px' } },
      children: [
        { component: 'p', props: { innerText: 'ssss' } },
        {
          component: 'input',
          props: { value: '$:model.text', onInput: '$:(e)=>model.text=e.target.value' },
        },
        { component: 'p', props: { innerText: '$:model.text' } },
        {
          component: 'input',
          props: {
            value: '$:model.obj.text',
            onInput: '$:(e)=>SET(model, "obj.text", e.target.value)',
          },
        },
      ],
    },

    {
      component: 'el-form',
      props: { labelWidth: '120px' },
      children: [
        {
          component: 'el-input',
          formItem: { label: 'ssss' },
          rel: true,
          props: {
            style: { width: 'auto' },
            modelValue: '$:model.obj.text',
            'onUpdate:modelValue': '$:(e)=>SET(model, "obj.text", e)',
          },
          children: [{ component: 'span', slot: 'append', props: { innerText: 'aaa' } }],
        },
      ],
    },
  ],
})

const onSetup = ({ onBeforeRender }) => {
  onBeforeRender((field, next) => {
    if (!field.formItem) {
      return next(field)
    }

    const formItem = field.formItem

    delete field.formItem

    return next({ component: 'el-form-item', props: formItem, children: [field] })
  })

  onBeforeRender((field, next) => {
    if (field.rel !== true) {
      return next(field)
    }

    let counter = 3

    next({ component: 'p', props: { innerText: `Loading (${counter + 1})` } })

    const timer = setInterval(() => {
      if (counter > 0) {
        next({ component: 'p', props: { innerText: `Loading (${counter})` } })
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
  <div>
    <JRender :fields="configs.fields" v-model="configs.model" @setup="onSetup" />
    <p>{{ JSON.stringify(configs.model) }}</p>
  </div>
</template>
