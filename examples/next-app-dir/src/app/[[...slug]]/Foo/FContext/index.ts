import { createServerContext } from 'react'
import { addPatch } from './actions'

export const createStore = async () => {
  'use server'
  const store = {
    patches: [] as string[],
    // addPatch: async (patch: string) => {
    //   'use server'
    //   console.log('addPatch', { patch, store })
    //   // await addPatch(patch, store)
    // },
    // async (patch: string) {
    //   'use server'
    //   store.patches.push(patch)

    //   if (store.patches.length > 10) {
    //     store.patches = store.patches.slice(1)
    //   }
    // },
  }

  store.addPatch = addPatch.bind(null, store)

  return store
}

export default createServerContext('FContext', createStore())
