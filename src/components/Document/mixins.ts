import { computed, inject, nextTick, provide, reactive, watch } from 'vue'
import { cleanObject, insertToArray, removeFromArray } from './helper'
import { toTreeNodeProxy, getNodeId } from './tree'

const treeToken = Symbol('treeToken')
const treeNodeToken = Symbol('treeNodeToken')

let treeCounter = 0

const defaults = {
  methods: {
    generateId: () => {
      return ++treeCounter
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

export const useTreeRoot = (params) => {
  const { state = {}, methods = {}, emit } = params

  const context = {
    state: reactive({ ...state, changes: [], from: null }),
    methods: { ...defaults.methods, ...cleanObject(methods) },
    emit,
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

export const useTree = () => {
  return inject(treeToken, {
    state: reactive({ dragging: false }),
    emit: (evt, params?) => {},
    ...defaults,
  })
}

export const useTreeNode = (params) => {
  if (params) {
    const { node, context, emit } = params
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
    return inject(treeNodeToken) as {
      node
      text
      children
      isLeaf
      isOpen
      onToggleOpen
    }
  }
}
