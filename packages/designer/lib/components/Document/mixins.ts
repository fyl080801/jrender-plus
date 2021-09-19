import { cleanObject, guid } from '@jrender-plus/core'
import { computed, inject, nextTick, provide, reactive, watch } from 'vue'
import { insertToArray, removeFromArray } from '../../utils/helper'
import { toTreeNodeProxy, getNodeId } from '../../utils/tree'

const treeToken = Symbol('treeToken')
const treeNodeToken = Symbol('treeNodeToken')

const defaults = {
  methods: {
    generateId: () => {
      return guid()
    },
    isLeaf: (node) => {
      return node.isLeaf === true
    },
    getNodeText: (node) => {
      return node.text
    },
    isOpen: (node) => {
      return node.isOpen === true
    },
    toggleOpen: (node) => {
      node.isOpen = !node.isOpen
    },
  },
}

export const useDocumentRoot = (params) => {
  const { state = {}, methods = {} } = params

  const context = {
    state: reactive({ ...state, changes: [], from: null }),
    methods: { ...defaults.methods, ...cleanObject(methods) },
  }

  provide(treeToken, context)

  watch(
    () => context.state.changes.length,
    (value) => {
      if (value <= 0) {
        return
      }

      nextTick(() => {
        context.state.changes.forEach(({ from, to }) => {
          const remove = removeFromArray(from.node.children, from.index)
          insertToArray((to.node.children ||= []), to.index, remove)
        })

        context.state.changes.length = 0
      })
    },
  )

  return context
}

export const useDocument = () => {
  return inject(treeToken, { state: reactive({ dragging: false }), ...defaults })
}

export const useDocumentNode = (params?) => {
  if (params) {
    const { node, context } = params
    const { methods } = context

    const text = computed(() => {
      return methods.getNodeText(node)
    })

    const children = computed(() => {
      return (node.children || []).map((child) => {
        return toTreeNodeProxy(child)(methods.generateId(node), getNodeId(node))
      })
    })

    const isLeaf = computed(() => {
      return methods.isLeaf(node)
    })

    const isOpen = computed(() => {
      return methods.isOpen(node)
    })

    const onToggleOpen = () => {
      methods.toggleOpen(node)
    }

    const nodeContext = {
      node,
      text,
      children,
      isLeaf,
      isOpen,
      onToggleOpen,
    }

    provide(treeNodeToken, nodeContext)

    return nodeContext
  } else {
    return inject(treeNodeToken)
  }
}
