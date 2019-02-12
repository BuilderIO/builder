// TODO: typedoc this
export interface BuilderElement {
  '@type': '@builder.io/sdk:Element'
  '@version': number
  id: string
  tagName?: string
  layerName?: string
  class?: string
  children?: BuilderElement[]
  responsiveStyles?: {
    large?: Partial<CSSStyleDeclaration>
    medium?: Partial<CSSStyleDeclaration>
    small?: Partial<CSSStyleDeclaration>
  }
  component?: {
    name: string,
    options?: any
  }
  bindings?: {
    [key: string]: string
  }
  actions?: {
    [key: string]: string
  }
  properties?: {
    [key: string]: string
  }
  repeat?: {
    collection: string
    itemName?: string
  }
}
