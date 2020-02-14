import { safeEvaluate } from './mapperEvaluator'
import { executeGet } from './selectionsClient'

const selectionsCache = new Map()

const orchestrateSelections = async (url: string, mapper: String) => {
  const cacheKey = url
  if (selectionsCache.has(cacheKey)) return selectionsCache.get(cacheKey)
  const data = await executeGet(url)
  const mappedSelections = safeEvaluate(mapper, { data })

  selectionsCache.set(cacheKey, mappedSelections)
  return mappedSelections
}

export { orchestrateSelections }
