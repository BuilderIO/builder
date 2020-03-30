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
