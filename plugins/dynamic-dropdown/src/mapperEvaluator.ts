// @ts-ignore
import SES from 'ses'

const safeEvaluate = (code: String, context: any = {}) => {
  if (typeof window !== 'undefined') {
    // workaround realm-shems thinking it's a node context
    // Remove once this line updated
    // testing isNode = (this===global)
    // https://github.com/Agoric/realms-shim/blob/master/src/unsafeRec.js#L28
    (window as any).global = null
  }
  const realm = SES.makeSESRootRealm({
    consoleMode: 'allow'
  })

  const result = realm.evaluate(code, context)
  return result
}

export { safeEvaluate }
