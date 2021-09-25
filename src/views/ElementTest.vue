<script lang="ts">
import { reactive, createBlock, createVNode, openBlock, defineComponent } from 'vue'

export default defineComponent({
  setup() {
    const model: any = reactive({ text: '' })

    const rules = {
      text: [{ required: true }],
      selected: [{ required: true }],
    }
    // openBlock()
    // createBlock('', {}, [])
    return {
      model,
      rules,
    }
  },
})
</script>

<template>
  <el-form :model="model" :rules="rules" label-width="120px">
    <div>
      <p>aaaaaaa</p>
    </div>
    <div>
      <el-form-item label="aaa" prop="text">
        <div>
          <el-input v-model="model.text"></el-input>
        </div>
      </el-form-item>
    </div>
    <el-form-item label="bbb" prop="selected">
      <el-select v-model="model.selected"></el-select>
    </el-form-item>
  </el-form>
</template>
