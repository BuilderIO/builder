export const extractLocales = (builderContext: any) => {
  let sourceLocale = undefined
  let targetLocales = undefined
  try {
    sourceLocale = builderContext.designerState.editingContentModel.data.toJSON()
      .locale
    targetLocales = builderContext.designerState.editingContentModel.model.fields
      .find((field: any) => field.name === 'locale')
      .enum.toJSON()

    targetLocales.splice(targetLocales.indexOf(sourceLocale), 1)
  } catch {}
  return [sourceLocale, targetLocales]
}

export const extractMemsourceToken = (builderContext: any) => {
  try {
    return builderContext.designerState.editingContentModel.model.fields
      .find((field: any) => field.name === 'memsourceToken')
      .toJSON()
  } catch {
    return undefined
  }
}
