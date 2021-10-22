<script lang="ts" setup>
import { reactive, onMounted, ref, nextTick } from 'vue'
import yaml from 'js-yaml'
import { saveAs } from 'file-saver'
import ejs from 'ejs'
import { CodeEditor } from '@/components'

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
        new Blob([ejs.render(text, { model: JSON.stringify(configs) })], {
          type: 'text/plain;charset=utf-8',
        }),
        'export.html',
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
    <div class="w-1/6 h-full overflow-auto border-r border-gray-300 border-solid">
      <ul>
        <a v-for="link in demos" @click="load(link.url)" class="cursor-pointer">
          <li>{{ link.title }}</li>
        </a>
        <a class="cursor-pointer" @click="toCustom"><li>随意编辑</li></a>
      </ul>
    </div>
    <div class="flex flex-col flex-1">
      <div class="flex py-2 border-b border-gray-300">
        <div class="flex-1"></div>
        <button
          class="flex items-center justify-center px-4 py-2 mx-3 text-white transition duration-200 ease-in-out bg-blue-400 rounded cursor-pointer  focus:scale-110 focus:outline-none hover:bg-blue-500"
          @click="exportTemplate"
        >
          导出当前布局
        </button>
      </div>
      <div class="flex flex-1">
        <div class="flex-1">
          <CodeEditor
            :model-value="yamldata"
            @change="onConfigChange"
            language="yaml"
            class="w-full h-full"
          />
        </div>
        <div class="flex-1 overflow-auto">
          <JRender
            v-if="!loading"
            v-model="configs.model"
            :fields="configs.fields"
            :listeners="configs.listeners"
            :data-source="configs.datasource"
            @setup="onSetup"
          />
          <!-- <p>{{ JSON.stringify(configs.model) }}</p> -->
        </div>
      </div>
    </div>
  </div>
</template>
