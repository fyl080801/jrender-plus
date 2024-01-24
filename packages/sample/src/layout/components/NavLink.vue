<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'

defineProps({
  link: Object,
})

const route = useRoute()

const current = computed(() => route.name)
</script>

<template>
  <RouterLink
    :to="link"
    class="block px-4 h-full lg:(inline-block) text-gray-200 hover:(text-white) cursor-pointer"
    :class="{ 'text-white': current === link.name }"
  >
    <slot />
  </RouterLink>
</template>
