import { action, store } from './base'

export interface SampleState {
  document: Array<any>
}

export interface SampleActions {
  sync: Function
}

const sync = action(() => () => {
  
})

export const useSampleStore = store<SampleState, SampleActions>(
  {
    document: [],
  },
  {
    sync,
  },
)
