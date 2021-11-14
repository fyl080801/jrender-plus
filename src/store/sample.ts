import { dbTables, getLocalDB } from '@/utils/storage'
import { action, store } from './base'
import { toRaw } from 'vue'

export interface SampleState {
  document: Array<any>
}

export interface SampleActions {
  sync: Function
}

const initLocal = (state) => {
  const dbPromise = getLocalDB()

  return async (_, next) => {
    await next()

    if (!state.document?.length) {
      state.document = await Promise.all(
        [
          { title: '基本示例', url: '/yaml/sample.yaml' },
          { title: '表单验证', url: '/yaml/formtest.yaml' },
          { title: '列表', url: '/yaml/table.yaml' },
        ].map(async (item) => {
          const response = await fetch(item.url)
          return {
            title: item.title,
            content: await response.text(),
          }
        }),
      )

      const tx = (await dbPromise).transaction(dbTables.SAMPLE, 'readwrite')

      state.document.forEach((item) => {
        tx.store.add({ ...toRaw(item) })
      })

      await tx.done
    }
  }
}

const sync = action(initLocal, (state) => {
  const dbPromise = getLocalDB()

  return async () => {
    state.document = await (await dbPromise).getAll(dbTables.SAMPLE)
  }
})

const add = action((state) => {
  const dbPromise = getLocalDB()

  return async (payload) => {
    const adding = toRaw(payload)

    const tx = (await dbPromise).transaction(dbTables.SAMPLE, 'readwrite')

    tx.store.add(adding)

    await tx.done

    state.document.push(adding)
  }
})

export const useSampleStore = store<SampleState, SampleActions>(
  {
    document: [],
  },
  {
    sync,
    add,
  },
)
