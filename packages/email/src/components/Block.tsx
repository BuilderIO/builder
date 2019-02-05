import { BuilderBlock, BuilderBlocks } from '@builder.io/react'
import React from 'react'
import { getStyles } from '../functions/get-styles'

interface BlockProps {
  builderBlock: any
  attributes: any
}

export class Block extends React.Component<BlockProps> {
  outerTable: HTMLTableElement | null = null

  componentDidMount() {
    this.updateTableAttributes()
  }

  componentDidUpdate() {
    this.updateTableAttributes()
  }

  // Why is this required...
  updateTableAttributes() {
    const allStyles = getStyles(this.props.builderBlock)
    if (this.outerTable) {
      this.outerTable.style.width = (allStyles && allStyles.width) || '100%'
    }
  }

  render() {
    const allStyles = getStyles(this.props.builderBlock) || {}
    const innerStyles = {
      ...allStyles,
      marginTop: undefined,
      marginBottom: undefined,
      marginLeft: undefined,
      marginRight: undefined,
      width: '100%'
    }

    const align =
      allStyles.marginRight === 'auto' && allStyles.marginLeft === 'auto'
        ? 'center'
        : allStyles.marginLeft === 'auto'
          ? 'right'
          : 'left'
    const vAlign =
      allStyles.marginBottom === 'auto' && allStyles.marginTop === 'auto'
        ? 'middle'
        : allStyles.marginLeft === 'auto'
          ? 'bottom'
          : 'top'
    const midStyles = {
      paddingTop: allStyles.marginTop,
      paddingRight: allStyles.marginRight,
      paddingBottom: allStyles.marginBottom,
      paddingLeft: allStyles.marginLeft,
      verticalAlign: vAlign,
      width: '100%'
    }
    const attributes: any = this.props.attributes || {}

    const hasLink = attributes.href

    const marginTop = parseFloat(allStyles.marginTop || 0)
    const marginBottom = parseFloat(allStyles.marginBottom || 0)
    const marginLeft = parseFloat(allStyles.marginLeft || 0)
    const marginRight = parseFloat(allStyles.marginRight || 0)

    const hasMargin = Boolean(marginTop || marginBottom || marginLeft || marginRight)

    const InnerTag = hasLink ? 'a' : 'span'

    // TODO: only double wrap if hasMargin
    return (
      <table
        ref={ref => (this.outerTable = ref)}
        cellPadding="0"
        cellSpacing="0"
        builder-id={attributes['builder-id']}
        className={attributes.class}
        style={{
          width: '100%'
        }}
        {...{
          width: allStyles.width || '100%'
          // height: allStyles.height || '100%'
        }}
      >
        <tbody style={{ color: 'green' }}>
          <tr>
            {/* TODO: how vertical align? height: 100% by default? for fixed height hm */}
            <td {...{ align, vAlign }} style={midStyles}>
              <InnerTag>
                <table
                  cellPadding="0"
                  cellSpacing="0"
                  style={{
                    width: '100%'
                  }}
                >
                  <tbody>
                    {/* TODO: only double wrap if margin */}
                    <tr>
                      <td style={innerStyles}>{this.props.children}</td>
                    </tr>
                  </tbody>
                </table>
              </InnerTag>
            </td>
          </tr>
        </tbody>
      </table>
    )
  }
}
