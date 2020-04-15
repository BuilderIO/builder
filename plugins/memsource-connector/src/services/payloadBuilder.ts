export const generatePayload = (builderContext: any) => {
  try {
    const payloadMetadata = getPageOptions(builderContext)
    const translatablePageData = getTranslatablePageOptions(builderContext)

    const translatableComponents = getTranslatableComponents(builderContext)
    return {
      __context: payloadMetadata,
      content: translatableComponents.concat(translatablePageData)
    }
  } catch {}
}

const getPageOptions = (builderContext: any) => {
  const { email } = builderContext.user.data
  const {
    modelName,
    id,
    name
  } = builderContext.designerState.editingContentModel
  const data = builderContext.designerState.editingContentModel.data.toJSON()
  delete data.blocks
  return { ...data, modelName, pageId: id, requestor: email, pageName: name }
}

const getTranslatablePageOptions = (builderContext: any) => {
  const pageData = builderContext.designerState.editingContentModel.data.toJSON()
  const translatablePageOptions = builderContext.designerState.editingContentModel.model.fields
    .map((each: any) => each.toJSON())
    .filter(
      (each: any) =>
        ['text', 'longText'].includes(each.type) &&
        each.hideFromUI === false &&
        each.enum == undefined
    )
    .map((each: any) => {
      if (pageData[each.name]) {
        return {
          __id: `page-${each.name}`,
          __optionKey: each.name,
          toTranslate: pageData[each.name]
        }
      }
    })
    .filter((each: any) => each)

  return translatablePageOptions
}

const getTranslatableComponents = (builderContext: any) => {
  const usedComponentsSchema = _getComponentsUsedSchema(builderContext)
  const translatableComponentNames = _getTranslatableComponentNames(
    builderContext
  )
  const translatableComponents = builderContext.designerState.editingContentModel.data
    .get('blocks')
    .toJSON()
    .map((each: any) => extractAllOccurrencies(each.toJSON(), 'component'))
    .flat()
    .filter((each: any) => translatableComponentNames.includes(each.name))
    .map((each: any) => _mapComponentToPayload(each, usedComponentsSchema))
    .flat()
    .filter((each: any) => each)

  return translatableComponents
}

const _getComponentsUsedSchema = (builderContext: any) => {
  return builderContext.designerState.editingContentModel.meta
    .get('componentsUsed')
    .toJSON()
}

const _getTranslatableComponentNames = (builderContext: any) => {
  const schema = _getComponentsUsedSchema(builderContext)
  const translatableComponentNames = []
  for (let key in schema) {
    const comp = schema[key]
    if (
      comp.inputs.some((input: any) =>
        ['text', 'longText'].includes(input.type)
      )
    ) {
      translatableComponentNames.push(key)
    }
  }

  return translatableComponentNames
}

const _mapComponentToPayload = (component: any, schema: any) => {
  const { name, options, id } = component
  const translatableInputs = Object.values(
    schema[name].inputs
      .filter((each: any) => ['text', 'longText'].includes(each.type))
      .map((each: any) => each.name)
  )
    .map((each: any) => {
      if (options[each]) {
        return {
          __id: id,
          __optionKey: each,
          toTranslate: options[each]
        }
      }
    })
    .filter((each: any) => each)

  return translatableInputs
}

const extractAllOccurrencies = (builderBlock: any, key: string) => {
  return recursiveExtraction(builderBlock, key, [])
}

const recursiveExtraction = (
  builderBlock: any,
  key: string,
  ocurrencies: Array<any>
) => {
  if (!builderBlock) return ocurrencies
  if (builderBlock instanceof Array) {
    for (var datum in builderBlock) {
      ocurrencies = ocurrencies.concat(
        recursiveExtraction(builderBlock[datum], key, [])
      )
    }
    return ocurrencies
  }
  if (builderBlock && builderBlock.id && builderBlock[key]) {
    ocurrencies.push({ ...builderBlock[key], id: builderBlock.id })
  }

  if (typeof builderBlock == 'object' && builderBlock !== null) {
    var children = Object.keys(builderBlock)
    if (children.length > 0) {
      for (let i = 0; i < children.length; i++) {
        ocurrencies = ocurrencies.concat(
          recursiveExtraction(builderBlock[children[i]], key, [])
        )
      }
    }
  }
  return ocurrencies
}
