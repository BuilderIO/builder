import { BuilderBlock, BuilderBlocks } from '@builder.io/react'
import React from 'react'
import { getStyles } from '../functions/get-styles'

interface BlockProps {
  builderBlock?: any
  noInnerWrap?: boolean
}

export class Block extends React.Component<BlockProps> {
  render() {
    return (
      <table cellPadding="0" cellSpacing="0" style={getStyles(this.props.builderBlock)}>
        <tbody>
          {this.props.noInnerWrap ? (
            this.props.children
          ) : (
            <tr>
              <td>{this.props.children}</td>
            </tr>
          )}
        </tbody>
      </table>
    )
  }
}
