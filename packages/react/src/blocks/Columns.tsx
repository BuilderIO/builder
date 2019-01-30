import React from 'react'

import { BuilderBlock } from '../decorators/builder-block.decorator'
import { BuilderBlocks } from '../components/builder-blocks.component'

const DEFAULT_ASPECT_RATIO = 0.7004048582995948

const defaultBlocks = [
  {
    '@type': '@builder.io/sdk:Element',
    responsiveStyles: {
      large: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        flexShrink: '0',
        position: 'relative',
        marginTop: '30px',
        textAlign: 'center',
        lineHeight: 'normal',
        height: 'auto'
      }
    },
    component: {
      name: 'Image',
      options: {
        image:
          'https://builder.io/api/v1/image/assets%2Fpwgjf0RoYWbdnJSbpBAjXNRMe9F2%2Ffb27a7c790324294af8be1c35fe30f4d',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        aspectRatio: DEFAULT_ASPECT_RATIO
      }
    }
  },
  {
    '@type': '@builder.io/sdk:Element',
    responsiveStyles: {
      large: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        flexShrink: '0',
        position: 'relative',
        marginTop: '30px',
        textAlign: 'center',
        lineHeight: 'normal',
        height: 'auto'
      }
    },
    component: {
      name: 'Text',
      options: {
        text: '<p>Enter some text...</p>'
      }
    }
  }
]

@BuilderBlock({
  name: 'Columns',
  inputs: [
    {
      name: 'columns',
      type: 'array',
      subFields: [
        {
          name: 'blocks',
          type: 'array',
          hideFromUI: true,
          defaultValue: defaultBlocks
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
    },
    {
      name: 'stackColumnsAt',
      type: 'string',
      defaultValue: 'mobile',
      helperText: 'Convert horizontal columns to vertical at what device size',
      enum: ['tablet', 'mobile'],
      advanced: true
    },
    {
      name: 'reverseColumnsWhenStacked',
      type: 'boolean',
      defaultValue: false,
      helperText: 'When stacking columns for mobile devices, reverse the ordering',
      advanced: true
    }
  ]
})
export class Columns extends React.Component<any> {
  // TODO: Column interface
  get columns(): any[] {
    return this.props.columns || []
  }

  get gutterSize(): number {
    return typeof this.props.space === 'number' ? this.props.space || 0 : 20
  }

  getWidth(index: number) {
    return (this.columns[index] && this.columns[index].width) || 100 / this.columns.length
  }

  getColumnWidth(index: number) {
    const { columns, gutterSize } = this
    const subtractWidth = (gutterSize * (columns.length - 1)) / columns.length
    return `calc(${this.getWidth(index)}% - ${subtractWidth}px)`
  }

  render() {
    const { columns, gutterSize } = this

    return (
      // FIXME: make more elegant
      <React.Fragment>
        <style>
          {`
            .builder-columns {
              display: flex;
            }

            .builder-column {
              line-height: normal;
            }

            .builder-column > .builder-blocks {
              flex-grow: 1;
            }
          `}
        </style>
        <style>
          {`
          @media (max-width: ${this.props.stackColumnsAt !== 'tablet' ? 639 : 999}px) {
            .${this.props.builderBlock.id} > .builder-columns {
              flex-direction: ${this.props.reverseColumnsWhenStacked ? 'column-reverse' : 'column'};
              align-items: stretch;
            }

            .${this.props.builderBlock.id} > .builder-columns > .builder-column {
              width: 100% !important;
              margin-left: 0 !important;
            }
          }
        `}
        </style>
        <div className="builder-columns" style={{ display: 'flex' }}>
          {columns.map((col, index) => {
            const TagName = col.link ? 'a' : 'div'

            return (
              <TagName
                key={index}
                className="builder-column"
                {...(col.link ? { href: col.link } : null)}
                style={{
                  width: this.getColumnWidth(index),
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  marginLeft: index === 0 ? 0 : gutterSize
                }}
              >
                <BuilderBlocks
                  key={index}
                  // TODO: childOf [parentBlocks]?
                  child
                  parentElementId={this.props.builderBlock && this.props.builderBlock.id}
                  blocks={col.blocks}
                  dataPath={`component.options.columns.${index}.blocks`}
                />
              </TagName>
            )
          })}
        </div>
      </React.Fragment>
    )
  }
}
