<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { editor } from 'monaco-editor/esm/vs/editor/editor.api'
import 'monaco-editor/esm/vs/editor/browser/coreCommands'
import 'monaco-editor/esm/vs/editor/contrib/format/browser/formatActions'
import 'monaco-editor/esm/vs/editor/contrib/find/browser/findController'
import 'monaco-editor/esm/vs/editor/contrib/suggest/browser/suggestController' // 代码提示
import 'monaco-editor/esm/vs/editor/contrib/comment/browser/comment' // 注释快捷键
import 'monaco-editor/esm/vs/editor/contrib/folding/browser/folding' // 折叠
import 'monaco-editor/esm/vs/editor/contrib/wordHighlighter/browser/wordHighlighter'
import 'monaco-editor/esm/vs/editor/contrib/wordOperations/browser/wordOperations'
import 'monaco-editor/esm/vs/editor/contrib/wordPartOperations/browser/wordPartOperations'
// import 'monaco-editor/esm/vs/editor/contrib/linesOperations/browser/linesOperations'
import 'monaco-editor/esm/vs/basic-languages/yaml/yaml.contribution'

// setDiagnosticsOptions({
//   enableSchemaRequest: true,
//   hover: true,
//   completion: true,
//   validate: true,
//   format: true,
// })
// ;(self as any).MonacoEnvironment = {
//   getWorker(_, label) {
//     if (label === 'json') {
//       return new JsonWorker()
//     }
//     if (label === 'yaml') {
//       return new YamlWorker()
//     }
//     return new EditorWorker()
//   },
// }

const props = defineProps({
  modelValue: { type: String, required: true },
  language: { type: String, default: 'json' },
  debounce: { type: Number, default: 1000 },
})

const emit = defineEmits(['update:modelValue', 'change'])

const domRef = ref()
let instance: editor.IStandaloneCodeEditor

const debounce = (fn, delay) => {
  let timeout = null
  return () => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      fn()
    }, delay)
  }
}

const debouncer = debounce(() => {
  emit('change', instance?.getValue())
}, props.debounce)

onMounted(async () => {
  instance = editor.create(domRef.value, {
    value: props.modelValue,
    tabSize: 2,
    automaticLayout: true,
    scrollBeyondLastLine: false,
    language: props.language,
  })

  instance?.onDidChangeModelContent(() => {
    emit('update:modelValue', instance?.getValue())
    debouncer()
  })
})

onBeforeUnmount(() => {
  instance?.getModel()?.dispose()
  instance?.dispose()
})

watch(
  () => props.modelValue,
  () => {
    instance?.setValue(props.modelValue)
    emit('change', instance?.getValue())
    // instance?.getAction('editor.action.formatDocument').run()
  },
)
</script>

<template>
  <div class="h-full" ref="domRef"></div>
</template>
