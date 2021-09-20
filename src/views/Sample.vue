<script lang="ts" setup>
import { reactive, onMounted } from 'vue'
import { fetchYaml } from '@/utils/data'

const configs = reactive({
  model: {},
  datasource: {},
  listeners: [],
  fields: [],
})

const onSetup = ({ onBeforeRender }) => {
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

const onUpdate = () => {
  configs.fields[0].children.push({ component: 'span', props: { innerText: 'cccc' } }) // = [{ component: 'span', props: { innerText: 'cccc' } }]
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
    >
      <template v-slot:head>
        <h1>head</h1>
      </template>
      <h2>subtitle</h2>
    </JRender>
    <p>{{ JSON.stringify(configs.model) }}</p>
    <button @click="onUpdate">change</button>

    <!-- <ul>
      <li v-for="item in configs.model['checks']">{{ item }}</li>
    </ul> -->
  </div>
</template>
