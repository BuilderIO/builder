export const generatePayload = (builderContext: any) => {
  const usedComponentsSchema = builderContext.designerState.editingContentModel.meta
    .get('componentsUsed')
    .toJSON()

  console.log('generatePayload -> usedComponentsSchema', usedComponentsSchema)
  const usedComponentsForTranslation: Array<string> = []
  for (let key in usedComponentsSchema) {
    const comp = usedComponentsSchema[key]
    if (
      comp.inputs.some((input: any) =>
        ['text', 'longText'].includes(input.type)
      )
    ) {
      usedComponentsForTranslation.push(key)
    }
  }

  console.log(
    'generatePayload -> usedComponentsForTranslation',
    usedComponentsForTranslation
  )
  const translatableComponents = builderContext.designerState.editingContentModel.data
    .get('blocks')
    .toJSON()
    .map((each: any) => extractAllOccurrencies(each.toJSON(), 'component'))
    .flat()
    .filter((each: any) => usedComponentsForTranslation.includes(each.name))
    .map((each: any) => {
      const { name, options, id } = each
      const translatableInputs = Object.values(
        usedComponentsSchema[name].inputs
          .filter((each: any) => ['text', 'longText'].includes(each.type))
          .map((each: any) => each.name)
      )
        .map((each: any) => {
          if (options[each]) {
            return {
              id,
              optionKey: each,
              toTranslate: options[each]
            }
          }
        })
        .filter((each: any) => each)

      return translatableInputs
    })
    .flat()
    .filter((each: any) => each)
  console.log(
    'generatePayload -> translatableComponents',
    translatableComponents
  )
}

export const extractAllOccurrencies = (builderBlock: any, key: string) => {
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
