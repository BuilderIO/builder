import { ElementType } from '@builder.io/sdk'

export function blockToLiquid(block: ElementType) {

}

interface StringMap {
  [key: string]: string | undefined | null
}
function mapToCss(map: StringMap, spaces = 2, important = false) {
  return reduce(
    map,
    (memo, value, key) => {
      return (
        memo +
        (value && value.trim()
          ? `\n${' '.repeat(spaces)}${kebabCase(key)}: ${value + (important ? ' !important' : '')};`
          : '')
      )
    },
    ''
  )
}

// TODO: make these core functions and share with react, vue, etc
function blockCss(block: ElementType) {
  // TODO: handle style bindings
  const self = this.props.block

  const baseStyles: Partial<CSSStyleDeclaration> = {
    ...(self.responsiveStyles && self.responsiveStyles.large)
  }

  let css = this.props.emailMode
    ? ''
    : `.builder-block.${self.id} {${mapToCss(baseStyles as StringMap)}}`

  const reversedNames = sizeNames.slice().reverse()
  if (self.responsiveStyles) {
    for (const size of reversedNames) {
      if (this.props.emailMode && size === 'large') {
        continue
      }
      if (
        size !== 'large' &&
        size !== 'xsmall' &&
        self.responsiveStyles[size] &&
        Object.keys(self.responsiveStyles[size]).length
      ) {
        // TODO: this will not work as expected for a couple things that are handled specially,
        // e.g. width
        css += `\n@media only screen and (max-width: ${sizes[size].max}px) { \n${this.props.emailMode ? '.' : '.builder-block.'}${self.id + (this.props.emailMode ? '-subject' : '')} {${mapToCss(
          self.responsiveStyles[size],
          4,
          this.props.emailMode
        )} } }`
      }
    }
  }
  return css
}
