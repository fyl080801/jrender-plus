<script setup>
import { NavLink, Logo } from './components'
import { RouterView } from 'vue-router'

const routes = [
  { title: '示例', link: { name: 'sample' } },
  // { title: '自定义组件嵌套', link: { name: 'nesting' } },
]
</script>

<template>
  <div class="absolute h-full w-full flex flex-col">
    <nav class="flex items-center justify-between flex-wrap bg-blue-500 p-6">
      <Logo> JRender+ </Logo>
      <div class="w-full block flex-grow lg:(flex items-center w-auto)">
        <div class="lg:flex-grow">
          <NavLink v-for="route in routes" :link="route.link">
            {{ route.title }}
          </NavLink>
        </div>
        <div></div>
      </div>
    </nav>
    <div class="flex-1 overflow-hidden">
      <RouterView />
    </div>
  </div>
</template>
