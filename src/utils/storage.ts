import { openDB } from 'idb'

export const STORAGE = 'jrender-plus-sample'

export const dbTables = {
  SAMPLE: 'sample',
}

export const initLocalDB = async () => {
  const currentVerion = 20

  await openDB(STORAGE, currentVerion, {
    upgrade: (db) => {
      if (db.objectStoreNames.contains(dbTables.SAMPLE)) {
        db.deleteObjectStore(dbTables.SAMPLE)
      }

      db.createObjectStore(dbTables.SAMPLE, { keyPath: 'id', autoIncrement: true })
    },
  })
}

export const getLocalDB = () => {
  return openDB(STORAGE)
}
