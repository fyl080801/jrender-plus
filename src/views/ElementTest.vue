<script lang="ts">
import { reactive, defineComponent, onUpdated } from 'vue'

export default defineComponent({
  setup() {
    const model: any = reactive({ text: '' })

    const list = reactive([
      { label: 'option 1', value: 1 },
      { label: 'option 2', value: 2 },
    ])

    const rules = {
      text: [{ required: true }],
      selected: [{ required: true }],
    }

    onUpdated(() => {
      console.log('xxx')
    })

    // openBlock()
    // createBlock('', {}, [])
    return {
      model,
      rules,
      list,
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
      <el-select v-model="model.selected" :clearable="true">
        <el-option
          v-for="(item, index) in list"
          :key="index"
          :label="item.label"
          :value="item.value"
        ></el-option>
      </el-select>
    </el-form-item>
  </el-form>
</template>
