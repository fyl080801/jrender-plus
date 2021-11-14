<script lang="ts" setup>
import { NavLink, Logo } from './components'

const routes = [
  { title: '示例', link: { name: 'sample' } },
  { title: '自定义组件嵌套', link: { name: 'nesting' } },
]
</script>

<template>
  <div class="absolute h-full w-full flex flex-col">
    <nav class="flex items-center justify-between flex-wrap bg-blue-500 p-6">
      <logo> JRender+ </logo>
      <div class="w-full block flex-grow lg:(flex items-center w-auto)">
        <div class="text-sm lg:flex-grow">
          <nav-link v-for="route in routes" :link="route.link">
            {{ route.title }}
          </nav-link>
        </div>
        <div></div>
      </div>
    </nav>
    <div class="flex-1 overflow-hidden">
      <router-view />
    </div>
  </div>
</template>
