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
      width: align === 'left' && allStyles.marginRight !== 'auto' && '100%'
    }
    const attributes: any = this.props.attributes || {}

    const hasLink = attributes.href

    const marginTop = parseFloat(allStyles.marginTop || 0)
    const marginBottom = parseFloat(allStyles.marginBottom || 0)
    const marginLeft = parseFloat(allStyles.marginLeft || 0)
    const marginRight = parseFloat(allStyles.marginRight || 0)

    const hasMargin = Boolean(marginTop || marginBottom || marginLeft || marginRight)
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
      width: '100%',
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
        className={attributes.class}
        style={{
          width: outerWidth,
          border: '0',
          display: outerDisplay,
          verticalAlign: outerVerticalAlign
        }}
      >
        <tbody>
          <tr>
            {/* TODO: how vertical align? height: 100% by default? for fixed height hm */}
            {(align === 'right' || align === 'center') && (
              <td style={{ width: align === 'center' ? '45%' : '90%' }} />
            )}
            <td {...{ align, vAlign }} style={midStyles as any}>
              <InnerTag>
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
                  <tbody>
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
