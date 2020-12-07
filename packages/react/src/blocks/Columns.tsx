/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';

import { Builder, BuilderElement } from '@builder.io/sdk';
import { BuilderBlocks } from '../components/builder-blocks.component';
import { withBuilder } from '../functions/with-builder';
import { Link } from '../components/Link';
import { number } from 'prop-types';

const DEFAULT_ASPECT_RATIO = 0.7004048582995948;

const defaultBlocks: BuilderElement[] = [
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
        height: 'auto',
        minHeight: '20px',
        minWidth: '20px',
        overflow: 'hidden',
      },
    },
    component: {
      name: 'Image',
      options: {
        image:
          'https://builder.io/api/v1/image/assets%2Fpwgjf0RoYWbdnJSbpBAjXNRMe9F2%2Ffb27a7c790324294af8be1c35fe30f4d',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        aspectRatio: DEFAULT_ASPECT_RATIO,
      },
    },
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
        height: 'auto',
      },
    },
    component: {
      name: 'Text',
      options: {
        text: '<p>Enter some text...</p>',
      },
    },
  },
];

interface ColumnProps {
  numColumns: number;
  stackColumnsAt?: string;
  link?: string;
  space?: number;
  width: number;
  index?: number | string;
  builderBlock?: BuilderElement;
  children?: BuilderBlocks;
}

const Column = (props: ColumnProps) => {
  const TagName = props.link ? Link : 'div';

  const getGutterSize = (): number => {
    return typeof props.space === 'number' ? props.space || 0 : 20;
  };

  const getWidth = (): number => {
    return props.width || 100 / props.numColumns;
  };

  const getColumnWidth = () => {
    const gutterSize = getGutterSize();
    const subtractWidth = (gutterSize * (props.numColumns - 1)) / props.numColumns;
    return `calc(${getWidth()}% - ${subtractWidth}px)`;
  };
  return (
    <React.Fragment key={props.index}>
      <TagName
        className="builder-column"
        {...(props.link ? { href: props.link } : null)}
        css={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          lineHeight: 'normal',
          ['& > .builder-blocks']: {
            flexGrow: 1,
          },
          width: getColumnWidth(),
          marginLeft: Number(props.index) === 0 ? 0 : getGutterSize(),
          ...(props.stackColumnsAt !== 'never' && {
            [`@media (max-width: ${props.stackColumnsAt !== 'tablet' ? 639 : 999}px)`]: {
              width: '100%',
              marginLeft: 0,
            },
          }),
        }}
      >
        <BuilderBlocks
          key={props.index}
          child
          parentElementId={props.builderBlock && props.builderBlock.id}
          blocks={props.children}
          dataPath={`component.options.columns.${props.index}.blocks`}
        />
      </TagName>
    </React.Fragment>
  );
};

class ColumnsComponent extends React.Component<any> {
  get columns(): any[] {
    return this.props.columns || [];
  }

  render() {
    const { columns } = this;

    return (
      <React.Fragment>
        <div
          className="builder-columns"
          css={{
            display: 'flex',
            ...(this.props.stackColumnsAt !== 'never' && {
              [`@media (max-width: ${this.props.stackColumnsAt !== 'tablet' ? 639 : 999}px)`]: {
                flexDirection: this.props.reverseColumnsWhenStacked ? 'column-reverse' : 'column',
                alignItems: 'stretch',
              },
            }),
          }}
        >
          {/* TODO: map these */}
          {this.props.children ? this.props.children : null}
          {columns.map((col, index) => {
            return (
              <Column
                numColumns={columns.length}
                space={this.props.space}
                width={this.columns[index] && this.columns[index].width}
                index={index}
                builderBlock={this.props.builderBlock}
                children={this.props.blocks}
                stackColumnsAt={this.props.stackColumnsAt}
              />
            );
          })}
        </div>
      </React.Fragment>
    );
  }
}

Builder.registerComponent(Column, {
  name: 'Column',
  noWrap: true,
  hideFromInsertMenu: true,
});

export const Columns = withBuilder(ColumnsComponent, {
  name: 'Columns',
  static: true,
  inputs: [
    {
      name: 'columns',
      type: 'array',
      subFields: [
        {
          name: 'blocks',
          type: 'array',
          hideFromUI: true,
          defaultValue: defaultBlocks,
        },
        {
          name: 'width',
          type: 'number',
          hideFromUI: true,
          helperText: 'Width %, e.g. set to 50 to fill half of the space',
        },
        {
          name: 'link',
          type: 'url',
          helperText: 'Optionally set a url that clicking this column will link to',
        },
      ],
      defaultValue: [{ blocks: defaultBlocks }, { blocks: defaultBlocks }],
      onChange: (options: Map<string, any>) => {
        function clearWidths() {
          columns.forEach(col => {
            col.delete('width');
          });
        }

        const columns = options.get('columns') as Array<Map<String, any>>;

        if (Array.isArray(columns)) {
          const containsColumnWithWidth = !!columns.find(col => col.get('width'));

          if (containsColumnWithWidth) {
            const containsColumnWithoutWidth = !!columns.find(col => !col.get('width'));
            if (containsColumnWithoutWidth) {
              clearWidths();
            } else {
              const sumWidths = columns.reduce((memo, col) => {
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
      type: 'number',
      defaultValue: 20,
      helperText: 'Size of gap between columns',
      advanced: true,
    },
    {
      name: 'stackColumnsAt',
      type: 'string',
      defaultValue: 'tablet',
      helperText: 'Convert horizontal columns to vertical at what device size',
      enum: ['tablet', 'mobile', 'never'],
      advanced: true,
    },
    {
      name: 'reverseColumnsWhenStacked',
      type: 'boolean',
      defaultValue: false,
      helperText: 'When stacking columns for mobile devices, reverse the ordering',
      advanced: true,
    },
  ],
});
