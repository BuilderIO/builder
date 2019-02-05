import { BuilderBlock, BuilderBlocks } from '@builder.io/react'
import React from 'react'
import { Block } from './Block'

interface ColumnsProps {
  columns: { content: any[]; width?: number }[]
  builderBlock?: any
  attributes?: any
}

const defaultBlocks: any[] = [] // TODO

@BuilderBlock({
  name: 'Email:Columns',
  inputs: [
    {
      name: 'columns',
      type: 'array',
      subFields: [
        {
          name: 'blocks',
          type: 'array',
          hideFromUI: true,
          defaultValue: [defaultBlocks]
        },
        {
          name: 'width',
          type: 'number',
          advanced: true,
          helperText: 'Width %, e.g. set to 50 to fill half of the space'
        }
      ],
      defaultValue: [{ blocks: defaultBlocks }, { blocks: defaultBlocks }],
      onChange: (options: Map<string, any>) => {
        function clearWidths() {
          columns.forEach(col => {
            col.delete('width')
          })
        }

        const columns = options.get('columns') as Array<Map<String, any>>

        if (Array.isArray(columns)) {
          const containsColumnWithWidth = !!columns.find(col => col.get('width'))

          if (containsColumnWithWidth) {
            const containsColumnWithoutWidth = !!columns.find(col => !col.get('width'))
            if (containsColumnWithoutWidth) {
              clearWidths()
            } else {
              const sumWidths = columns.reduce((memo, col) => {
                return memo + col.get('width')
              }, 0)
              const widthsDontAddUp = sumWidths !== 100
              if (widthsDontAddUp) {
                clearWidths()
              }
            }
          }
        }
      }
    },
    {
      name: 'space',
      type: 'number',
      defaultValue: 20,
      helperText: 'Size of gap between columns',
      advanced: true
    }
  ]
})
export class Columns extends React.Component<ColumnsProps> {
  render() {
    return (
      <Block attributes={this.props.attributes} builderBlock={this.props.builderBlock}>
        <table style={{ width: '100%' }} cellPadding="0" cellSpacing="0">
          <tbody>
            <tr>
              {this.props.columns.map((col, index) => (
                // TODO: width
                <td style={{ width: col.width }}>
                  <BuilderBlocks
                    blocks={col.content}
                    dataPath={`columns.${index}.blocks`}
                    emailMode
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </Block>
    )
  }
}
