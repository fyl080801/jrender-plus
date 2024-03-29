<script lang="ts" setup>
import { fetchYaml } from '@/utils/data'
import { useRootRender } from '@jrender-plus/core'
import { reactive, onMounted, watch, onBeforeUnmount } from 'vue'

useRootRender(({ onBind }) => {
  onBind(() => {
    const customs = {}
    const watchs = []

    const getCustom = (field, url) => {
      const nf = {
        component: 'JRender',
        props: {
          fields: customs[url].fields,
          dataSource: Object.keys(field.props || {}).reduce((target, key) => {
            target[key] = { props: field.props[key] }
            return target
          }, {}),
        },
        children: field.children,
      }

      return nf
    }

    onBeforeUnmount(() => {
      watchs.forEach((w) => w())
      watchs.length = 0
    })

    return (field, next) => {
      if (field.component !== 'custom') {
        return next(field)
      }

      watchs.push(
        watch(
          () => field.url,
          (url) => {
            if (!url) {
              return
            }

            if (customs[url]) {
              return next(getCustom(field, url))
            }

            fetchYaml(url).then((result) => {
              customs[url] = result
              next(getCustom(field, url))
            })
          },
          { immediate: true },
        ),
      )

      next()
    }
  })
})

const configs = reactive({
  model: {},
  datasource: {},
  listeners: [],
  fields: [],
})

onMounted(async () => {
  const { fields, listeners, datasource }: any = await fetchYaml('/yaml/nesting.yaml')
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
    >
    </JRender>
  </div>
</template>
