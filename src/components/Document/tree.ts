import { isArray, assignArray } from './helper'

export const NODEID = '__tree_node_id'
export const PARENTID = '__tree_parent_id'
export const PROXY = '__tree_proxy'
export const ORIGIN = '__tree_origin'

export const depthForEach = (roots, callback) => {
  const stack = (isArray(roots) ? assignArray(roots || []) : [roots]).filter((item) => item)
  const result = []

  stack.forEach((root) => {
    callback(root)
    result.push(root)
  })

  let node

  while (stack.length > 0) {
    node = stack.pop()

    node?.children?.forEach((child) => {
      callback(child, node)
      stack.push(child)
    })
  }

  return result
}

export const depthFilter = (roots, filter) => {
  const result = []

  depthForEach(roots || [], (node, parent) => {
    if (filter(node, parent)) {
      result.push(node)
    }
  })

  return result
}

export const isTreeNodeProxy = (node) => {
  return node[PROXY] || false
}

export const getNodeId = (node) => {
  if (!isTreeNodeProxy(node)) {
    return
  }
  return node[NODEID]
}

export const getParentId = (node) => {
  if (!isTreeNodeProxy(node)) {
    return
  }
  return node[PARENTID]
}

export const getOriginNode = (node) => {
  if (!isTreeNodeProxy(node)) {
    return node
  }
  return node[ORIGIN]
}

export const setParentId = (node, parentId) => {
  if (!isTreeNodeProxy(node)) {
    return false
  }

  return (node[PARENTID] = parentId)
}

export const toTreeNodeProxy = (node) => {
  return (nodeId, parentId) => {
    if (isTreeNodeProxy(node)) {
      return node
    } else {
      const nodeStore = {
        nodeId,
        parentId,
      }

      return new Proxy(node, {
        get: (target, p, receiver) => {
          if (p === NODEID) {
            return nodeStore.nodeId
          }

          if (p === PARENTID) {
            return nodeStore.parentId
          }

          if (p === PROXY) {
            return true
          }

          if (p === ORIGIN) {
            return node
          }

          return Reflect.get(target, p, receiver)
        },
        set: (target, p, value, receiver) => {
          if (p === PARENTID) {
            nodeStore.parentId = value
            return true
          }
          return Reflect.set(target, p, value, receiver)
        },
      })
    }
  }
}
