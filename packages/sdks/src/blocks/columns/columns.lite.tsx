import RenderBlocks from '../../components/render-blocks.lite';
import { componentInfo } from './component-info.js';
import { For, useState } from '@builder.io/mitosis';
import { useMetadata } from '@builder.io/mitosis';

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
      const _stackColumnsAt = props.stackColumnsAt || 'tablet';
      return _stackColumnsAt === 'tablet' ? prop : 'inherit';
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
