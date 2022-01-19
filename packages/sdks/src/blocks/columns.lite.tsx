import { useState, For } from '@builder.io/mitosis';
import RenderBlocks from '../components/render-blocks.lite';
import { registerComponent } from '../functions/register-component';

type Column = {
  blocks: any;
  // TODO: Implement this when support for dynamic CSS lands
  width?: number;
};

type StackColumnsAt = 'tablet' | 'mobile' | 'never';

export interface ColumnProps {
  columns?: Column[];

  // TODO: Implement this when support for dynamic CSS lands
  space?: number;
  // TODO: Implement this when support for dynamic CSS lands
  stackColumnsAt?: StackColumnsAt;
  // TODO: Implement this when support for dynamic CSS lands
  reverseColumnsWhenStacked?: boolean;
}

export default function Columns(props: ColumnProps) {
  const state = useState({
    getGutterSize(): number {
      return typeof props.space === 'number' ? props.space || 0 : 20;
    },
    getColumns() {
      return props.columns || [];
    },
    getWidth(index: number) {
      const columns = this.getColumns();
      return columns[index]?.width || 100 / columns.length;
    },
    getColumnCssWidth(index: number) {
      const columns = this.getColumns();
      const gutterSize = this.getGutterSize();
      const subtractWidth =
        (gutterSize * (columns.length - 1)) / columns.length;
      return `calc(${this.getWidth(index)}% - ${subtractWidth}px)`;
    },

    maybeApplyForTablet(prop: string) {
      const stackColumnsAt = props.stackColumnsAt || 'tablet';
      return stackColumnsAt === 'tablet' ? prop : 'inherit';
    },

    get columnsCssVars() {
      const flexDir =
        props.stackColumnsAt === 'never'
          ? 'inherit'
          : props.reverseColumnsWhenStacked
          ? 'column-reverse'
          : 'column';
      return {
        '--flex-dir': flexDir,
        '--flex-dir-tablet': this.maybeApplyForTablet(flexDir),
      };
    },

    get columnCssVars() {
      const width = '100%';
      const marginLeft = '0';
      return {
        '--column-width': width,
        '--column-margin-left': marginLeft,
        '--column-width-tablet': this.maybeApplyForTablet(width),
        '--column-margin-left-tablet': this.maybeApplyForTablet(marginLeft),
      };
    },
  });

  return (
    <div
      class="builder-columns"
      css={{
        display: 'flex',
        alignItems: 'stretch',
        lineHeight: 'normal',
        '@media (max-width: 999px)': {
          flexDirection: 'var(--flex-dir-tablet)',
        },
        '@media (max-width: 639px)': {
          flexDirection: 'var(--flex-dir)',
        },
      }}
      style={state.columnsCssVars}
    >
      <For each={props.columns}>
        {(column, index) => (
          <div
            style={{
              width: state.getColumnCssWidth(index),
              marginLeft: `${index === 0 ? 0 : state.getGutterSize()}px`,
              ...state.columnCssVars,
            }}
            class="builder-column"
            css={{
              flexGrow: '1',
              '@media (max-width: 999px)': {
                width: 'var(--column-width-tablet) !important',
                marginLeft: 'var(--column-margin-left-tablet) !important',
              },
              '@media (max-width: 639px)': {
                width: 'var(--column-width) !important',
                marginLeft: 'var(--column-margin-left) !important',
              },
            }}
          >
            <RenderBlocks blocks={column.blocks} />
          </div>
        )}
      </For>
    </div>
  );
}

registerComponent({
  // TODO: ways to statically preprocess JSON for references, functions, etc
  name: 'Columns',
  builtIn: true,
  inputs: [
    {
      name: 'columns',
      type: 'array',
      broadcast: true,
      subFields: [
        {
          name: 'blocks',
          type: 'array',
          hideFromUI: true,
          defaultValue: [
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
                  aspectRatio: 0.7004048582995948,
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
          ],
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
          helperText:
            'Optionally set a url that clicking this column will link to',
        },
      ],
      defaultValue: [
        {
          blocks: [
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
                  aspectRatio: 0.7004048582995948,
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
          ],
        },
        {
          blocks: [
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
                  aspectRatio: 0.7004048582995948,
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
          ],
        },
      ],
      onChange:
        "\
        function clearWidths() {\
          columns.forEach(col => {\
            col.delete('width');\
          });\
        }\
\
        const columns = options.get('columns') as Array<Map<String, any>>;\
\
        if (Array.isArray(columns)) {\
          const containsColumnWithWidth = !!columns.find(col => col.get('width'));\
\
          if (containsColumnWithWidth) {\
            const containsColumnWithoutWidth = !!columns.find(col => !col.get('width'));\
            if (containsColumnWithoutWidth) {\
              clearWidths();\
            } else {\
              const sumWidths = columns.reduce((memo, col) => {\
                return memo + col.get('width');\
              }, 0);\
              const widthsDontAddUp = sumWidths !== 100;\
              if (widthsDontAddUp) {\
                clearWidths();\
              }\
            }\
          }\
        }\
      ",
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
      helperText:
        'When stacking columns for mobile devices, reverse the ordering',
      advanced: true,
    },
  ],
});
