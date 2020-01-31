const getMassagedProps = (props: any): any => {
  const givenUrl = props.field.url.givenUrl
  if (givenUrl == null)
    throw new Error('Missing { url: { givenUrl: "" } } required option')

  const mapper = props.field.mapper
  if (mapper == null) throw new Error('Missing { mapper: "" } required option')

  const requiredProps = { givenUrl, mapper }

  const editingContentModelData =
    props.context.designerState.editingContentModel.data

  const propsPluginContext = props.field.pluginContext
  let pluginContext: Array<any> = []
  if (typeof propsPluginContext === 'object') {
    propsPluginContext.forEach((contextKey: string) => {
      const value = editingContentModelData.get(contextKey)
      if (value) pluginContext.push({ [contextKey]: value })
    })
  }

  const massagedProps = {
    pluginContext,
    ...requiredProps
  }

  if (pluginContext === []) {
    delete massagedProps.pluginContext
  }

  return massagedProps
}

export { getMassagedProps }
