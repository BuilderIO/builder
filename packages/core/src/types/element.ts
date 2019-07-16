// TODO: typedoc this
export interface BuilderElement {
  '@type': '@builder.io/sdk:Element'
  '@version'?: number
  id?: string
  tagName?: string
  layerName?: string
  class?: string
  children?: BuilderElement[]
  responsiveStyles?: {
    large?: Partial<CSSStyleDeclaration>
    medium?: Partial<CSSStyleDeclaration>
    small?: Partial<CSSStyleDeclaration>
    // DEPRECATED
    xsmall?: Partial<CSSStyleDeclaration>
  }
  component?: {
    name: string,
    options?: any
    tag?: string
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
  } | null
  animations?: any[] // TODO: type the animation spec
}
