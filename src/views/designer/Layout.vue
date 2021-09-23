<script lang="ts" setup>
import { reactive } from 'vue'
import { Container } from '@/components'
import { Navbar } from './Navbar'

const data = reactive([{ title: 'aaa', children: [{ title: 'bbb', children: [] }] }])
</script>

<template>
  <div class="designer" style="height: 100%; width: 100%">
    <Container class="position-absolute d-flex flex-column w-100 h-100">
      <Navbar></Navbar>
      <Container class="flex-fill"> content </Container>
    </Container>
  </div>
</template>
