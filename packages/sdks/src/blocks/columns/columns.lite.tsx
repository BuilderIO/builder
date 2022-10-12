import RenderBlocks from '../../components/render-blocks.lite';
import { For, useStore } from '@builder.io/mitosis';
import type { BuilderBlock } from '../../types/builder-block';
import { markMutable } from '../../functions/mark-mutable';

type CSS = {
  [key: string]: string;
};

type Column = {
  blocks: any;
  // TODO: Implement this when support for dynamic CSS lands
  width?: number;
};

type StackColumnsAt = 'tablet' | 'mobile' | 'never';

export interface ColumnProps {
  columns?: Column[];
  builderBlock: BuilderBlock;

  // TODO: Implement this when support for dynamic CSS lands
  space?: number;
  // TODO: Implement this when support for dynamic CSS lands
  stackColumnsAt?: StackColumnsAt;
  // TODO: Implement this when support for dynamic CSS lands
  reverseColumnsWhenStacked?: boolean;
}

export default function Columns(props: ColumnProps) {
  const state = useStore({
    getGutterSize(): number {
      return typeof props.space === 'number' ? props.space || 0 : 20;
    },
    getColumns() {
      return props.columns || [];
    },
    getWidth(index: number) {
      const columns = state.getColumns();
      return columns[index]?.width || 100 / columns.length;
    },
    getColumnCssWidth(index: number) {
      const columns = state.getColumns();
      const gutterSize = state.getGutterSize();
      const subtractWidth =
        (gutterSize * (columns.length - 1)) / columns.length;
      return `calc(${state.getWidth(index)}% - ${subtractWidth}px)`;
    },

    maybeApplyForTablet(prop: string | undefined): string | undefined {
      const _stackColumnsAt = props.stackColumnsAt || 'tablet';
      return _stackColumnsAt === 'tablet' ? prop : 'inherit';
    },

    get columnsCssVars(): { [key: string]: string | undefined } {
      const flexDir =
        props.stackColumnsAt === 'never'
          ? 'inherit'
          : props.reverseColumnsWhenStacked
          ? 'column-reverse'
          : 'column';
      return {
        '--flex-dir': flexDir,
        '--flex-dir-tablet': state.maybeApplyForTablet(flexDir),
      };
    },

    get columnCssVars(): { [key: string]: string | undefined } {
      const width = '100%';
      const marginLeft = '0';
      return {
        '--column-width': width,
        '--column-margin-left': marginLeft,
        '--column-width-tablet': state.maybeApplyForTablet(width),
        '--column-margin-left-tablet': state.maybeApplyForTablet(marginLeft),
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
        '@media (max-width: 991px)': {
          flexDirection: 'var(--flex-dir-tablet)',
        },
        '@media (max-width: 639px)': {
          flexDirection: 'var(--flex-dir)',
        },
      }}
      style={state.columnsCssVars as CSS}
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
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              '@media (max-width: 991px)': {
                width: 'var(--column-width-tablet) !important',
                marginLeft: 'var(--column-margin-left-tablet) !important',
              },
              '@media (max-width: 639px)': {
                width: 'var(--column-width) !important',
                marginLeft: 'var(--column-margin-left) !important',
              },
            }}
            key={index}
          >
            <RenderBlocks
              blocks={markMutable(column.blocks)}
              path={`component.options.columns.${index}.blocks`}
              parent={props.builderBlock.id}
              styleProp={{ flexGrow: '1' }}
            />
          </div>
        )}
      </For>
    </div>
  );
}
