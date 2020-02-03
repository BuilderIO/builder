import { render } from 'mustache'

const getMassagedProps = (props: any): any => {
  const { url, mapper } = props.field.options

  if (isNullOrEmpty(url)) throw new Error('Missing { url: "" } required option')
  if (isNullOrEmpty(mapper))
    throw new Error('Missing { mapper: "" } required option')

  // const renderedUrl = render(
  //   url,
  //   props.context.designerState.editingContentModel.data.toJSON()
  // )
  const renderedUrl =
    'https://merchandising-product-service.cdn.vpsvc.com/api/v3/MerchandisingProductViewAll/vistaprint/en-IE?requestor=asier'

  const massagedProps = { url: renderedUrl, mapper }

  return massagedProps
}

const isNullOrEmpty = (input: String) => {
  if (input == null) return true

  if (typeof input === 'string') return input.trim().length === 0

  return true
}

export { getMassagedProps }
