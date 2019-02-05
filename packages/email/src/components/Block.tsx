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
    const allStyles = getStyles(this.props.builderBlock)
    const innerStyles = {
      ...allStyles,
      marginTop: undefined,
      marginBottom: undefined,
      marginLeft: undefined,
      marginRight: undefined,
      width: '100%'
    }

    const midStyles = {
      paddingTop: allStyles.marginTop,
      paddingRight: allStyles.marginRight,
      paddingBottom: allStyles.marginBottom,
      paddingLeft: allStyles.marginLeft,
      width: '100%'
    }
    const attributes: any = this.props.attributes || {}

    const hasMargin = Boolean(
      allStyles.marginTop || allStyles.marginBottom || allStyles.marginLeft || allStyles.marginRight
    )

    // TODO: only double wrap if hasMargin
    return (
      <table
        ref={ref => (this.outerTable = ref)}
        cellPadding="0"
        cellSpacing="0"
        builder-id={attributes['builder-id']}
        className={attributes.class}
      >
        <tbody style={{ color: 'green' }}>
          <tr>
            <td style={midStyles}>
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
            </td>
          </tr>
        </tbody>
      </table>
    )
  }
}
