<script lang="ts" setup>
import { reactive, onMounted, watch } from 'vue'
import { fetchYaml } from '@/utils/data'

const configs = reactive({
  model: {},
  datasource: {},
  listeners: [],
  fields: [],
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
    if (!field.radios) {
      return next(field)
    }

    field.children = field.radios.map((item) => ({
      component: 'el-radio',
      props: { label: item.value },
      children: [{ component: 'span', props: { innerText: item.name } }],
    }))

    next(field)
  })

  onBeforeRender((field, next) => {
    if (!field.checkboxs) {
      return next(field)
    }

    field.children = field.checkboxs.map((item) => ({
      component: 'el-checkbox',
      props: { label: item.value },
      children: [{ component: 'span', props: { innerText: item.name } }],
    }))

    next(field)
  })

  onBeforeRender((field, next) => {
    if (!field.options) {
      return next(field)
    }

    field.children = field.options.map((item) => ({
      component: 'el-option',
      props: { value: item, label: `选项 ${item}` },
    }))

    next(field)
  })

  onBeforeRender((field, next) => {
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

const onUpdate = () => {
  configs.fields[1].children.push({ component: 'span', props: { innerText: 'cccc' } }) // = [{ component: 'span', props: { innerText: 'cccc' } }]
}

onMounted(async () => {
  const { fields, listeners, datasource }: any = await fetchYaml('/yaml/sample.yaml')
  configs.fields = fields
  configs.listeners = listeners
  configs.datasource = datasource
})
</script>

<template>
  <div>
    <JRender
      v-model="configs.model"
      :fields="configs.fields"
      :listeners="configs.listeners"
      :data-source="configs.datasource"
      @setup="onSetup"
    />
    <p>{{ JSON.stringify(configs.model) }}</p>
    <button @click="onUpdate">change</button>
  </div>
</template>
