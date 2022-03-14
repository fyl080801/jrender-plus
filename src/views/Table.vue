<script lang="ts" setup>
import { fetchYaml } from '@/utils/data'
import { reactive, onMounted } from 'vue'

const configs = reactive({
  model: {},
  fields: [],
  listeners: [],
  datasource: {},
})

const onSetup = () => {}

onMounted(async () => {
  const { fields, listeners, datasource }: any = await fetchYaml('/yaml/table.yaml')
  configs.fields = fields
  configs.listeners = listeners
  configs.datasource = datasource
})
</script>

<template>
  <div>
    <j-render
      v-model="configs.model"
      :fields="configs.fields"
      :listeners="configs.listeners"
      :data-source="configs.datasource"
      @setup="onSetup"
    />
  </div>
</template>
