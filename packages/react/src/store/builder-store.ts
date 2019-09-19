import React from 'react'

export const BuilderStoreContext = React.createContext({
  state: {} as any,
  rootState: {} as any,
  update: (mutator: (state: any) => any) => null as any
})
