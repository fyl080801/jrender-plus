<script lang="ts" setup>
import { reactive, onMounted, ref } from 'vue'
import yaml from 'js-yaml'
import { fetchYaml } from '@/utils/data'
import { CodeEditor } from '@/components'

const configs = reactive({
  model: {},
  datasource: {},
  listeners: [],
  fields: [],
})

const yamldata = ref('')

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

const onConfigChange = (result) => {
  const { fields, listeners, datasource }: any = yaml.load(result)
  configs.fields = fields
  configs.listeners = listeners
  configs.datasource = datasource
}

onMounted(async () => {
  const result = await fetchYaml('/yaml/sample.yaml')
  yamldata.value = yaml.dump(result)
  const { fields, listeners, datasource }: any = result
  configs.fields = fields
  configs.listeners = listeners
  configs.datasource = datasource
})
</script>

<template>
  <div class="flex w-full h-full">
    <div class="flex-1">
      <CodeEditor
        :model-value="yamldata"
        @update:model-value="onConfigChange"
        language="yaml"
        style="width: 100%; height: 100%"
      ></CodeEditor>
    </div>
    <div class="flex-1 overflow-auto">
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
      <!-- <p>{{ JSON.stringify(configs.model) }}</p>
      <button @click="onUpdate">change</button> -->
    </div>
  </div>
</template>
