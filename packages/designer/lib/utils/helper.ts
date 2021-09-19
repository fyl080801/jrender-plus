import { isArray } from '@jrender-plus/core'

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
