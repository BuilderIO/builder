import { BuilderBlock, BuilderBlocks } from '@builder.io/react'
import React from 'react'
import { getStyles } from '../functions/get-styles'

interface BlockProps {
  builderBlock: any
  attributes: any
  innerStyleOverrides?: any
}

export class Block extends React.Component<BlockProps> {
  outerTable: HTMLTableElement | null = null

  render() {
    const allStyles = getStyles(this.props.builderBlock) || {}

    const align =
      allStyles.marginRight === 'auto' && allStyles.marginLeft === 'auto'
        ? 'center'
        : allStyles.marginLeft === 'auto'
          ? 'right'
          : 'left'
    const vAlign =
      allStyles.marginBottom === 'auto' && allStyles.marginTop === 'auto'
        ? 'middle'
        : allStyles.marginTop === 'auto'
          ? 'bottom'
          : 'top'
    const midStyles = {
      paddingTop: allStyles.marginTop,
      paddingRight: allStyles.marginRight,
      paddingBottom: allStyles.marginBottom,
      paddingLeft: allStyles.marginLeft,
      verticalAlign: vAlign,
      width: align === 'left' && allStyles.marginRight !== 'auto' && '100%' || undefined
    }
    const attributes: any = this.props.attributes || {}

    const hasLink = attributes.href

    const hasAutoMargin = allStyles.marginLeft === 'auto' || allStyles.marginRight === 'auto'

    const InnerTag = hasLink ? 'a' : 'span'

    const hasPxWidth = allStyles.width && allStyles.width.trim().endsWith('px')

    const outerWidth = hasPxWidth && hasAutoMargin ? 'auto' : allStyles.width || '100%'
    const outerDisplay = allStyles.display
    const outerVerticalAlign = allStyles.verticalAlign

    const innerStyles = {
      verticalAlign: 'top',
      ...allStyles,
      marginTop: undefined,
      marginBottom: undefined,
      marginLeft: undefined,
      marginRight: undefined,
      width:  align === 'left' && allStyles.marginRight !== 'auto' && '100%' || undefined,
      display: undefined,
      // verticalAlign: undefined,
      ...this.props.innerStyleOverrides
      // height: '100%',
    }

    // TODO: only double wrap if hasMargin
    return (
      <table
        ref={ref => (this.outerTable = ref)}
        cellPadding="0"
        cellSpacing="0"
        builder-id={attributes['builder-id']}
        className={attributes.className}
        style={{
          width: outerWidth,
          border: '0',
          display: outerDisplay,
          verticalAlign: outerVerticalAlign
        }}
      >
        <tbody style={{ width: '100%' }}>
          <tr>
            {/* TODO: how vertical align? height: 100% by default? for fixed height hm */}
            {(align === 'right' || align === 'center') && (
              <td style={{ width: align === 'center' ? '45%' : '90%' }} />
            )}
            <td {...{ align, vAlign }} style={midStyles as any}>
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
                  style={{
                    width: hasPxWidth && hasAutoMargin ? allStyles.width : '100%',
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
            {(align === 'left' || align === 'center') && (
              <td style={{ width: align === 'center' ? '45%' : '90%' }} />
            )}
          </tr>
        </tbody>
      </table>
    )
  }
}
