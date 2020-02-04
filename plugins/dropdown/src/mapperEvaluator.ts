// @ts-ignore
import SES from 'ses'

const compare = (a: any, b: any) => {
  if (a.name < b.name) return -1
  if (a.name > b.name) return 1
  return 0
}

const safeEvaluate = (code: String, context: any = {}) => {
  const realm = SES.makeSESRootRealm({
    consoleMode: 'allow'
  })

  const result = realm.evaluate(code, context)
  return result
}

const extractSelections = (code: String, context: any = {}) => {
  const result = safeEvaluate(code, context)

  result.sort(compare)

  return result
}

export { extractSelections }
