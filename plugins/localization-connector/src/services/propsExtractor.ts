import { generatePayload } from './blocksExtractor'

export const extractLocales = (builderContext: any) => {
  let sourceLocale = undefined
  try {
    sourceLocale = builderContext.designerState.editingContentModel.data.toJSON()
      .locale
  } catch {}

  let targetLocales = undefined
  try {
    targetLocales = builderContext.designerState.editingContentModel.model.fields
      .find((field: any) => field.name === 'locale')
      .enum.toJSON()

    if (targetLocales.includes(sourceLocale)) {
      targetLocales.splice(targetLocales.indexOf(sourceLocale), 1)
    }
  } catch {}

  return [sourceLocale, targetLocales]
}

export const extractMemsourceToken = (builderContext: any) => {
  try {
    return builderContext.designerState.editingContentModel.model.fields
      .find((field: any) => field.name === 'memsourceToken')
      .toJSON().defaultValue
  } catch {
    return ''
  }
}

export const extractProjectName = (builderContext: any) => {
  try {
    const { editingContentModel } = builderContext.designerState
    const modelName = editingContentModel.model.name
    const pageName = editingContentModel.data.toJSON().title
    const sourceLocale = editingContentModel.data.toJSON().locale
    return `${modelName}__${pageName}__${sourceLocale}`
  } catch {
    return ''
  }
}

export const extractPayload = (builderContext: any) => {
  generatePayload(builderContext)
}
