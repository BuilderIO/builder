import { BuilderBlock, BuilderBlocks } from '@builder.io/react'
import React from 'react'
import { Block } from './Block'

interface ColumnsProps {
  columns: { content: any[]; width?: number }[]
  builderBlock?: any
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
          hideFromUI: true,
          helperText: 'Width %, e.g. set to 50 to fill half of the space'
        },
        {
          name: 'link',
          type: 'string',
          helperText: 'Optionally set a url that clicking this column will link to'
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
      <Block noInnerWrap builderBlock={this.props.builderBlock}>
        <tr>
          {this.props.columns.map((col, index) => (
            <td>
              <BuilderBlocks blocks={col.content} dataPath={`columns.${index}.content`} emailMode />
            </td>
          ))}
        </tr>
      </Block>
    )
  }
}
