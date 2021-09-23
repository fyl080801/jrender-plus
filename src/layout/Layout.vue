<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const routes = [
  { title: '示例', link: { name: 'sample' } },
  { title: '自定义组件嵌套', link: { name: 'nesting' } },
]

const route = useRoute()

const current = computed(() => route.name)
</script>

<template>
  <div class="absolute h-full w-full flex flex-col">
    <nav class="flex items-center justify-between flex-wrap bg-blue-500 p-6">
      <div class="flex items-center flex-shrink-0 text-white mr-6">
        <span class="font-semibold text-xl tracking-tight">JRender+</span>
      </div>
      <div class="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
        <div class="text-sm lg:flex-grow">
          <router-link
            v-for="route in routes"
            :to="route.link"
            class="
              block
              mt-4
              lg:inline-block lg:mt-0
              text-teal-200
              hover:text-white
              mr-4
              cursor-pointer
            "
            :class="{ 'text-white': current === route.link.name }"
          >
            {{ route.title }}
          </router-link>
        </div>
        <div></div>
      </div>
    </nav>
    <div class="flex-1 overflow-hidden">
      <router-view />
    </div>
  </div>
</template>
