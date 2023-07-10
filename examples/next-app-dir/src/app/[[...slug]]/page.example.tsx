import FooButton from './FooButton'
import React, { cache } from 'react'
import FContext, { createStore } from './Foo/FContext'
import ContextUpdater from './Foo/ContextUpdater'
import { cookies } from 'next/headers'
import { addPatch } from './Foo/FContext/actions'

export default async function Page(props: any) {
  const cookieStore = cookies()
  const builderCookies = cookieStore
    .getAll()
    .filter((x) => x.name.startsWith('builder.patch.'))
    .map((x) => {
      return {
        blockId: x.name.split('builder.patch.')[1],
        value: x.value,
      }
    })

  // const store = {
  //   patches: [] as string[],
  //   // addPatch: async (patch: string) => {
  //   //   'use server'
  //   //   console.log('addPatch', { patch, store })
  //   //   // await addPatch(patch, store)
  //   // },
  //   // async (patch: string) {
  //   //   'use server'
  //   //   store.patches.push(patch)

  //   //   if (store.patches.length > 10) {
  //   //     store.patches = store.patches.slice(1)
  //   //   }
  //   // },
  // }
  // store.addPatch = addPatch.bind(null, store)

  console.log(builderCookies)
  return (
    // <FContext.Provider value={store}>
    // <ContextUpdater {...props}>
    <div>
      <div>
        builder cookies:{' '}
        {builderCookies.map((x) => (
          <div key={x.blockId}>
            block #{x.blockId}: {x.value}
          </div>
        ))}
      </div>
      <FooButton />
    </div>
    // </ContextUpdater>
    // </FContext.Provider>
  )
}
