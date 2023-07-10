'use server'

export async function addPatch(store: { patches: string[] }, patch: string) {
  'use server'
  store.patches.push(patch)

  if (store.patches.length > 10) {
    store.patches = store.patches.slice(1)
  }
}
