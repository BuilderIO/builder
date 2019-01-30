import React from 'react'

export const BuilderStoreContext = React.createContext({
  state: {},
  update: (mutator: (state: any) => void) => {}
})
