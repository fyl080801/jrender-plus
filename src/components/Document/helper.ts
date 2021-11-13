export const isArray = (target) => {
  return Array.isArray(target)
}

export const isObject = (target) => {
  return target !== null && typeof target === 'object'
}

export const isFunction = (target) => {
  return typeof target === 'function'
}

export const assignArray = (...targets) => {
  return targets.reduce((pre, cur) => {
    return pre.concat(cur)
  }, [])
}

export const assignObject = (...targets) => {
  return Object.assign({}, ...targets)
}

export const forEachTarget = (target, iteratee) => {
  if (isArray(target)) {
    for (let i = 0; i < target.length; i++) {
      iteratee(target[i], i, target)
    }
  } else if (typeof target === 'object' && target !== undefined) {
    for (const key in target) {
      iteratee(target[key], key, target)
    }
  }
}

const isNumberLike = (value) => {
  return String(value).match(/^\d+$/)
}

const toPath = (pathString) => {
  if (isArray(pathString)) {
    return pathString
  }
  if (typeof pathString === 'number') {
    return [pathString]
  }
  pathString = String(pathString)

  // lodash 的实现 - https://github.com/lodash/lodash
  const pathRx =
    /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(\.|\[\])(?:\4|$))/g
  const pathArray = []

  const replacer = (match, num, quote, str) => {
    pathArray.push(quote ? str : num !== undefined ? Number(num) : match)
    return pathArray[pathArray.length - 1]
  }

  pathString.replace(pathRx, replacer)

  return pathArray
}

const hasOwnProperty = (target, prop) => {
  return Object.prototype.hasOwnProperty.call(target, prop)
}

export const deepSet = (target, path, value) => {
  const fields = isArray(path) ? path : toPath(path)
  const prop = fields.shift()

  if (!fields.length) {
    return (target[prop] = value)
  }

  if (!hasOwnProperty(target, prop) || target[prop] === null) {
    // 当前下标是数字则认定是数组
    const objVal = fields.length >= 1 && isNumberLike(fields[0]) ? [] : {}
    target[prop] = objVal
  }

  deepSet(target[prop], fields, value)
}

export const deepGet = (target, path) => {
  const fields = isArray(path) ? path : toPath(path)

  if (!fields.length) {
    return target
  }

  let prop = fields.shift()
  let result = target

  while (prop) {
    result = result[prop]
    prop = fields.shift()
  }

  return result
}

export const deepClone = (item) => {
  if (!item) {
    return item
  } // null, undefined values check

  const types = [Number, String, Boolean]
  let result

  // normalizing primitives if someone did new String('aaa'), or new Number('444');
  types.forEach((type) => {
    if (item instanceof type) {
      result = type(item)
    }
  })

  if (typeof result == 'undefined') {
    if (isArray(item)) {
      result = []
      item.forEach((child, index) => {
        result[index] = deepClone(child)
      })
    } else if (isObject(item)) {
      // testing that this is DOM
      if (item.nodeType && isFunction(item.cloneNode)) {
        result = item.cloneNode(true)
      } else if (!item.prototype) {
        // check that this is a literal
        if (item instanceof Date) {
          result = new Date(item)
        } else {
          // it is an object literal
          result = {}
          for (const i in item) {
            result[i] = deepClone(item[i])
          }
        }
      } else {
        // depending what you would like here,
        // just keep the reference, or create new object
        if (item.constructor) {
          // would not advice to do that, reason? Read below
          result = new item.constructor()
        } else {
          result = item
        }
      }
    } else {
      result = item
    }
  }

  return result
}

export const isPromise = (val) => {
  return isObject(val) && isFunction(val.then) && isFunction(val.catch)
}

export const cleanObject = (input) => {
  return Object.keys(input).reduce((target, key) => {
    if (target[key] === undefined) {
      delete target[key]
    }
    return target
  }, input)
}

export const insertToArray = (target, index, value) => {
  if (!isArray(target) || index < 0) {
    return value
  }

  return target.splice(index, 0, value)
}

export const removeFromArray = (target, index) => {
  if (!isArray(target) || index < 0) {
    return
  }

  const removing = target[index]

  for (var i = 0, n = 0; i < target.length; i++) {
    if (target[i] !== target[index]) {
      target[n++] = target[i]
    }
  }

  target.length -= 1

  return removing
}

// export const generateId = () => {
//   return v4().replace(/-/g, '')
// }
