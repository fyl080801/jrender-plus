<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'normal',
    validator: (t: string) => {
      return ['normal', 'primary'].indexOf(t) >= 0
    },
  },
})

const classNames = computed(() => {
  return props.type === 'primary'
    ? [
        'text-white',
        'border-blue-400',
        'bg-blue-400',
        'hover:(bg-blue-500 border-blue-500)',
        'active:(bg-blue-600 border-blue-600)',
      ]
    : [
        'text-gray-500',
        'border-gray-300',
        'bg-white',
        'hover:(bg-blue-50 border-blue-200 text-blue-500)',
        'active:border-blue-500',
      ]
})
</script>

<template>
  <button
    class="
      flex
      border border-solid
      items-center
      justify-center
      px-5
      py-3
      ring-inset
      transition
      duration-200
      ease-in-out
      rounded
      cursor-pointer
      focus:(scale-110
      outline-none)
    "
    :class="classNames"
  >
    <span class="leading-none">
      <slot />
    </span>
  </button>
</template>
