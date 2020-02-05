// @ts-ignore
import SES from 'ses'

const safeEvaluate = (code: String, context: any = {}) => {
  const realm = SES.makeSESRootRealm({
    consoleMode: 'allow'
  })

  const result = realm.evaluate(code, context)
  return result
}

export { safeEvaluate }
