import { deepGet, hasOwnProperty, isArray, isNumberLike, toPath } from './helper'

const computeMatch = /^\$:/g

export const compute =
  ({ functional }) =>
  (value) => {
    const handler = (context) => {
      try {
        const keys = Object.keys(context)
        const funcKeys = Object.keys(functional)
        return new Function(...[...keys, ...funcKeys], `return ${value.replace(computeMatch, '')}`)(
          ...[...keys.map((key) => context[key]), ...funcKeys.map((key) => functional[key])],
        )
      } catch {
        //
      }
    }

    return typeof value === 'string' && computeMatch.test(value) && handler
  }

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
  const data = options()?.data
  return data !== undefined && data !== null ? data : {}
}
