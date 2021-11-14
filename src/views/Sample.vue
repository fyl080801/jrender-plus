<script lang="ts" setup>
import { reactive, onMounted, ref } from 'vue'
import yaml from 'js-yaml'
import { saveAs } from 'file-saver'
import ejs from 'ejs'
import { CodeEditor, SampleButton } from '@/components'

const demos = [
  { title: '基本示例', url: '/yaml/sample.yaml' },
  { title: '表单验证', url: '/yaml/formtest.yaml' },
  { title: '列表', url: '/yaml/table.yaml' },
]

const configs = reactive({
  model: {},
  datasource: {},
  listeners: [],
  fields: [],
})

const loading = ref(false)

const yamldata = ref('')

const onSetup = () => {}

const onConfigChange = (value) => {
  try {
    const { fields, listeners, datasource, model }: any = yaml.load(value)
    configs.model = model || {}
    configs.fields = fields
    configs.listeners = listeners
    configs.datasource = datasource
  } catch {
    //
  }
}

const load = async (url) => {
  loading.value = true
  const result = await fetch(url)
  configs.model = {}
  yamldata.value = await result.text()
  loading.value = false
}

const toCustom = () => {
  yamldata.value = `---
datasource:

listeners:

fields:

`
}

const exportTemplate = () => {
  fetch('/template/template.ejs').then((response) => {
    response.text().then((text) => {
      saveAs(
        new Blob([ejs.render(text, { model: JSON.stringify(configs).replace(/(\n|\r)/g, '') })], {
          type: 'text/plain;charset=utf-8',
        }),
        'jrender-plus.html',
      )
    })
  })
}

onMounted(() => {
  load('/yaml/formtest.yaml')
})
</script>

<template>
  <div class="flex w-full h-full">
    <div class="w-1/6 h-full overflow-auto border-0 border-r border-solid border-gray-300">
      <ul>
        <a v-for="link in demos" @click="load(link.url)" class="cursor-pointer">
          <li>{{ link.title }}</li>
        </a>
        <a class="cursor-pointer" @click="toCustom"><li>随意编辑</li></a>
      </ul>
    </div>
    <div class="flex flex-col flex-1">
      <div class="flex py-2 border-solid border-0 border-b border-gray-300">
        <div class="flex-1"></div>
        <sample-button @click="exportTemplate"> 导出当前布局 </sample-button>
      </div>
      <div class="flex flex-1 h-full">
        <div class="flex-1">
          <code-editor
            :model-value="yamldata"
            @change="onConfigChange"
            language="yaml"
            class="w-full h-full"
          />
        </div>
        <div class="flex-1 h-full overflow-auto">
          <j-render
            v-if="!loading"
            v-model="configs.model"
            :fields="configs.fields"
            :listeners="configs.listeners"
            :data-source="configs.datasource"
            @setup="onSetup"
          />
        </div>
      </div>
    </div>
  </div>
</template>
