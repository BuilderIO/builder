import { BuilderElement } from '@builder.io/react'
import React from 'react'

interface BlockProps {
  builderBlock: BuilderElement
  attributes: any
  innerStyleOverrides?: any
}

const sizes = {
  xsmall: {
    min: 0,
    default: 0,
    max: 0
  },
  small: {
    min: 0,
    default: 321,
    max: 639
  },
  medium: {
    min: 640,
    default: 641,
    max: 999
  },
  large: {
    min: 1000,
    default: 1001,
    max: 1200
  },
  getWidthForSize(size: Size) {
    return this[size].default
  },
  getSizeForWidth(width: number) {
    for (const size of sizeNames) {
      const value = this[size]
      if (width <= value.max) {
        return size
      }
    }
    return 'large'
  }
}

type Size = 'large' | 'medium' | 'small' | 'xsmall'
const sizeNames: Size[] = ['xsmall', 'small', 'medium', 'large']

const camelCaseToKebabCase = (str?: string) =>
  str ? str.replace(/([A-Z])/g, g => `-${g[0].toLowerCase()}`) : ''

const cssCase = (property: string) => {
  if (!property) {
    return property
  }

  let str = camelCaseToKebabCase(property)

  if (property[0] === property[0].toUpperCase()) {
    str = '-' + str
  }

  return str
}

interface StringMap {
  [key: string]: string | undefined | null
}
function mapToCss(map: StringMap, spaces = 2, important = false) {
  return Object.keys(map).reduce((memo, key) => {
    const value = map[key]
    if (typeof value !== 'string') {
      return memo
    }
    return (
      memo +
      (value && value.trim()
        ? `\n${' '.repeat(spaces)}${cssCase(key)}: ${value + (important ? ' !important' : '')};`
        : '')
    )
  }, '')
}

export class Block extends React.Component<BlockProps> {
  outerTable: HTMLTableElement | null = null

  getAlign(size: Size) {
    const block = this.props.builderBlock
    const sizeStyles = block.responsiveStyles![size] || {}

    const align =
      sizeStyles.marginRight === 'auto' && sizeStyles.marginLeft === 'auto'
        ? 'center'
        : sizeStyles.marginLeft === 'auto'
          ? 'right'
          : 'left'

    return align
  }

  getVAlign(size: Size) {
    const block = this.props.builderBlock
    const sizeStyles = block.responsiveStyles![size] || {}
    const vAlign =
      sizeStyles.marginBottom === 'auto' && sizeStyles.marginTop === 'auto'
        ? 'middle'
        : sizeStyles.marginTop === 'auto'
          ? 'bottom'
          : 'top'
    return vAlign
  }

  getOuterStyles(size: Size) {
    const block = this.props.builderBlock
    const sizeStyles = block.responsiveStyles![size] || {}
    const hasAutoMargin = sizeStyles.marginLeft === 'auto' || sizeStyles.marginRight === 'auto'

    const hasPxWidth = sizeStyles.width && sizeStyles.width.trim().endsWith('px')

    const outerWidth = hasPxWidth && hasAutoMargin ? 'auto' : sizeStyles.width || '100%'
    const outerDisplay = sizeStyles.display
    const outerVerticalAlign = sizeStyles.verticalAlign

    const outerStyles = {
      width: '100%',
      border: '0',
      display: outerDisplay,
      verticalAlign: outerVerticalAlign
    }
    return outerStyles
  }

  getMidStyles(size: Size) {
    const block = this.props.builderBlock
    const sizeStyles = block.responsiveStyles![size] || {}

    const align = this.getAlign(size)
    const vAlign = this.getVAlign(size)

    const midStyles = {
      paddingTop: sizeStyles.marginTop,
      paddingRight: sizeStyles.marginRight,
      paddingBottom: sizeStyles.marginBottom,
      paddingLeft: sizeStyles.marginLeft,
      verticalAlign: vAlign,
      width: (align === 'left' && sizeStyles.marginRight !== 'auto' && '100%') || undefined
    }
    return midStyles
  }

  getInnerStyles(size: Size) {
    const block = this.props.builderBlock
    const align = this.getAlign(size)
    const sizeStyles = block.responsiveStyles![size] || {}
    const innerStyles = {
      verticalAlign: 'top',
      ...sizeStyles,
      marginTop: undefined,
      marginBottom: undefined,
      marginLeft: undefined,
      marginRight: undefined,
      width: (align === 'left' && sizeStyles.marginRight !== 'auto' && '100%') || undefined,
      display: undefined,
      ...this.props.innerStyleOverrides
    }
    return innerStyles
  }

  getInnerTableStyles(size: Size) {
    const block = this.props.builderBlock
    const sizeStyles = block.responsiveStyles![size] || {}
    const hasAutoMargin = sizeStyles.marginLeft === 'auto' || sizeStyles.marginRight === 'auto'
    const hasPxWidth = sizeStyles.width && sizeStyles.width.trim().endsWith('px')
    const align = this.getAlign(size)
    return {
      width: hasPxWidth
        ? sizeStyles.width
        : (align === 'left' && sizeStyles.marginRight !== 'auto' && '100%') || undefined
    }
  }

  getLeftTdStyle(size: Size) {
    const align = this.getAlign(size)
    return {
      // width: align === 'center' ? '45%' : '90%',
      display: align === 'right' || align === 'center' ? undefined : 'none'
    }
  }

  getRightTdStyle(size: Size) {
    const align = this.getAlign(size)
    const vAlign = this.getVAlign(size)

    return {
      // width: align === 'center' ? '45%' : '90%',
      display: align === 'left' || align === 'center' ? undefined : 'none'
    }
  }

  get css() {
    let css = ''
    const block = this.props.builderBlock

    if (!block) {
      return ''
    }

    const reversedNames = sizeNames.slice().reverse()

    if (block.responsiveStyles) {
      for (const size of reversedNames) {
        if (
          size !== 'large' &&
          size !== 'xsmall' &&
          block.responsiveStyles![size] &&
          Object.keys(block.responsiveStyles![size]!).length
        ) {
          css += `\n@media only screen and (max-width: ${sizes[size].max}px) { \n.${
            block.id
          } {${mapToCss(this.getOuterStyles(size), 4, true)} } }`

          css += `\n@media only screen and (max-width: ${sizes[size].max}px) { \n.${
            block.id
          }-inner {${mapToCss(this.getInnerTableStyles(size), 4, true)} } }`

          css += `\n@media only screen and (max-width: ${sizes[size].max}px) { \n.${
            block.id
          }-subject {${mapToCss(this.getInnerStyles(size), 4, true)} } }`

          css += `\n@media only screen and (max-width: ${sizes[size].max}px) { \n.${
            block.id
          }-middle {${mapToCss(this.getMidStyles(size), 4, true)} } }`

          // css += `\n@media only screen and (max-width: ${sizes[size].max}px) { \n.${
          //   block.id
          // }-right-td {${mapToCss(this.getRightTdStyle(size), 4, true)} } }`

          // css += `\n@media only screen and (max-width: ${sizes[size].max}px) { \n.${
          //   block.id
          // }-left-td {${mapToCss(this.getLeftTdStyle(size), 4, true)} } }`
        }
      }
    }

    return css
  }

  render() {
    const block = this.props.builderBlock

    const align = this.getAlign('large')
    const vAlign = this.getVAlign('large')
    const midStyles = this.getMidStyles('large')
    const attributes: any = this.props.attributes || {}

    const hasLink = attributes.href

    const InnerTag = hasLink ? 'a' : 'span'

    const innerStyles = this.getInnerStyles('large')

    // TODO: only double wrap if hasMargin
    return (
      <>
        <style className="builder-style">{this.css}</style>
        <table
          ref={ref => (this.outerTable = ref)}
          cellPadding="0"
          cellSpacing="0"
          builder-id={attributes['builder-id']}
          className={attributes.className}
          style={this.getOuterStyles('large') as any}
        >
          <tbody style={{ width: '100%' }}>
            <tr>
              {/* <td  className={`${block.id}-left-td`} style={this.getLeftTdStyle('large')} /> */}
              <td {...{ align, vAlign }} style={midStyles as any} className={`${block.id}-middle`}>
                <InnerTag
                  {...(hasLink
                    ? {
                        href: attributes.href,
                        target: '_blank',
                        style: {
                          textDecoration: 'none',
                          color: 'inherit'
                        }
                      }
                    : null)}
                >
                  <table
                    cellPadding="0"
                    cellSpacing="0"
                    className={`${block.id}-inner`}
                    style={{
                      ...(this.getInnerTableStyles('large') as any),
                      height: '100%'
                    }}
                    {...{
                      border: '0'
                    }}
                  >
                    <tbody style={{ width: '100%' }}>
                      {/* TODO: only double wrap if margin */}
                      <tr>
                        <td
                          className={`builder-block-subject ${this.props.builderBlock.id}-subject`}
                          style={innerStyles}
                        >
                          {this.props.children}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </InnerTag>
              </td>
              {/* <td className={`${block.id}-right-td`} style={this.getRightTdStyle('large')} /> */}
            </tr>
          </tbody>
        </table>
      </>
    )
  }
}
