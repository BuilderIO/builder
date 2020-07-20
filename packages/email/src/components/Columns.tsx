import { BuilderBlock, BuilderBlocks } from '@builder.io/react';
import React from 'react';
import { Block } from './Block';

interface ColumnsProps {
  columns: { blocks: any[]; width?: number }[];
  builderBlock?: any;
  attributes?: any;
  space?: number;
  stackColumnsAt?: string;
  verticalAlignContent?: string;
}

const defaultBlocks = [
  {
    '@type': '@builder.io/sdk:Element',
    responsiveStyles: {
      large: {
        marginTop: '20px',
        minWidth: '20px',
        overflow: 'hidden',
        fontSize: '0px',
      },
    },
    component: {
      name: 'Email:Image',
      options: {
        image:
          'https://builder.io/api/v1/image/assets%2Fpwgjf0RoYWbdnJSbpBAjXNRMe9F2%2Ffb27a7c790324294af8be1c35fe30f4d',
      },
    },
  },
  {
    '@type': '@builder.io/sdk:Element',
    responsiveStyles: {
      large: {
        marginTop: '20px',
        textAlign: 'center',
      },
    },
    component: {
      name: 'Email:Text',
      options: {
        text: '<span>Enter some text...</span>',
      },
    },
  },
];

@BuilderBlock({
  name: 'Email:Columns',
  inputs: [
    {
      name: 'columns',
      type: 'array',
      subFields: [
        {
          name: 'blocks',
          type: 'uiBlocks',
          hideFromUI: true,
          defaultValue: defaultBlocks,
        },
        {
          name: 'width',
          type: 'string',
          // defaultValue: 'auto',
          // advanced: true,
          helperText:
            'Width, e.g. set to "100px" to always be 100 pixels wide, or "50%" to always fill 50% of the entire space',
        },
        {
          name: 'verticalAlignContent',
          type: 'string',
          enum: ['top', 'bottom', 'middle'],
          defaultValue: 'top',
        },
      ],
      defaultValue: [
        { blocks: defaultBlocks, width: '50%' },
        { blocks: defaultBlocks, width: '50%' },
      ],
      onChange: (options: Map<string, any>) => {
        const columns = options.get('columns') as Map<String, any>[];
        const colsWithoutPx = columns.filter(col => {
          const width = col.get('width') || '';
          return !width.includes('px');
        });

        function round(num: number) {
          return Math.round(num * 1000) / 1000;
        }

        function clearWidths() {
          colsWithoutPx.forEach(col => {
            // TODO: round
            col.set('width', round(100 / colsWithoutPx.length) + '%');
          });
        }

        if (Array.isArray(columns)) {
          const containsColumnWithWidth = !!colsWithoutPx.find(col => col.get('width'));

          if (containsColumnWithWidth) {
            const containsColumnWithoutWidth = !!colsWithoutPx.find(col => !col.get('width'));
            if (containsColumnWithoutWidth) {
              clearWidths();
            } else {
              const sumWidths = colsWithoutPx.reduce((memo, col) => {
                return memo + col.get('width');
              }, 0);
              const widthsDontAddUp = sumWidths !== 100;
              if (widthsDontAddUp) {
                clearWidths();
              }
            }
          }
        }
      },
    },
    {
      name: 'space',
      friendlyName: 'Gap size',
      type: 'number',
      defaultValue: 20,
      helperText: 'Size of gap between columns',
      // advanced: true,
    },
    {
      name: 'stackColumnsAt',
      type: 'string',
      defaultValue: 'mobile',
      helperText: 'Convert horizontal columns to vertical at what device size',
      enum: ['tablet', 'mobile', 'never'],
    },
  ],
})
export class Columns extends React.Component<ColumnsProps> {
  render() {
    return (
      <Block attributes={this.props.attributes} builderBlock={this.props.builderBlock}>
        {this.props.stackColumnsAt && this.props.stackColumnsAt !== 'never' && (
          <style>
            {`
          @media only screen and (max-width:${
            this.props.stackColumnsAt === 'mobile' ? 639 : 999
          }px) {
            .${this.props.builderBlock.id}-separator-td {
              display: none !important;
            }

            .${this.props.builderBlock.id}-subject-td {
              display: block !important;
              width: 100% !important;
            }
          }
        `}
          </style>
        )}

        <table style={{ width: '100%' }} cellPadding="0" cellSpacing="0">
          <tbody>
            <tr>
              {this.props.columns.map((col, index) => (
                // TODO: width
                <React.Fragment key={index}>
                  {index !== 0 && (
                    <td
                      className={`${this.props.builderBlock.id}-separator-td`}
                      style={{
                        width: this.props.space,
                        minWidth: this.props.space,
                      }}
                    />
                  )}
                  <td
                    className={`${this.props.builderBlock.id}-subject-td`}
                    style={{
                      width: col.width,
                      verticalAlign: this.props.verticalAlignContent || 'top',
                    }}
                  >
                    <BuilderBlocks
                      blocks={col.blocks}
                      dataPath={`columns.${index}.blocks`}
                      emailMode
                    />
                  </td>
                </React.Fragment>
              ))}
            </tr>
          </tbody>
        </table>
      </Block>
    );
  }
}
