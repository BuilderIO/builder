import { MemsourceService } from '../services/memsourceService'
import {
  extractMemsourceToken,
  extractProjectName
} from '../services/propsExtractor'
import { generatePayload } from '../services/payloadBuilder'

export const handleSubmit = (
  builderContext: any,
  sourceLocale: string,
  selectedLocales: Set<string>
) => {
  const memsourceToken = extractMemsourceToken(builderContext)
  const svc = new MemsourceService(memsourceToken)
  const projectName = extractProjectName(builderContext)
  const payload = generatePayload(builderContext)
  console.log('handleSubmit -> payload', payload)
  svc
    .sendTranslationJob(
      projectName,
      sourceLocale,
      [...selectedLocales],
      payload
    )
    .then(() => {
      console.log('Request sent to memsource')
    })
    .catch((err: any) =>
      console.error('Error sending request to Memsource', err)
    )
}
