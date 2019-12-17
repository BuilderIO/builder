import React from 'react'

export const BuilderStoreContext = React.createContext<BuilderStore>({
  state: {},
  rootState: {},
  content: {},
  update: (mutator: (state: any) => any) => null
})

export interface BuilderStore {
  state: any
  rootState: any
  content: any
  update: (mutator: (state: any) => any) => any
}
