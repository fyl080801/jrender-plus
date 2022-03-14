import { reactive, ref } from 'vue'
import { deepGet, hasOwnProperty, isArray, isNumberLike, toPath } from './helper'

export const SET = (target, path, value) => {
  const fields = isArray(path) ? path : toPath(path)
  const prop = fields.shift()

  if (!fields.length) {
    return (target[prop] = value)
  }

  if (!hasOwnProperty(target, prop) || target[prop] === undefined) {
    const objVal = fields.length >= 1 && isNumberLike(fields[0]) ? [] : {}
    target[prop] = objVal
  }

  SET(target[prop], fields, value)
}

export const GET = (target, path, def) => {
  const origin = deepGet(target, path)

  if (origin === undefined) {
    SET(target, path, def !== undefined && def !== null ? def : null)
  }

  return origin !== undefined ? origin : def
}

// 只读改了也不响应
export const rawData = (options) => {
  const data = options() || {}
  return reactive(data !== undefined && data !== null ? data : {})
}

export const REF = (target) => {
  return ref(target)
}
