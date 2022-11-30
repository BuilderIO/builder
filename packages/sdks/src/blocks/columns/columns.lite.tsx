import RenderBlocks from '../../components/render-blocks.lite';
import { For, useStore } from '@builder.io/mitosis';
import type { BuilderBlock } from '../../types/builder-block';
import { getSizesForBreakpoints } from '../../constants/device-sizes';
import type { SizeName } from '../../constants/device-sizes';
import type { Breakpoints } from '../../types/builder-content';
import RenderInlinedStyles from '../../components/render-inlined-styles.lite';

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

  customBreakpoints?: Breakpoints;
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

    getWidthForBreakpointSize(size: SizeName) {
      const breakpointSizes = getSizesForBreakpoints(
        props.customBreakpoints || {}
      );

      return breakpointSizes[size].max;
    },

    get columnsStyles(): string {
      return `
        @media (max-width: ${state.getWidthForBreakpointSize('medium')}px) {
          .${props.builderBlock.id}-breakpoints {
            flex-direction: var(--flex-dir-tablet);
            align-items: stretch,
          }

          .${props.builderBlock.id}-breakpoints > .builder-column {
            width: var(--column-width-tablet) !important;
            margin-left: var(--column-margin-left-tablet) !important;
          }
        }

        @media (max-width: ${state.getWidthForBreakpointSize('small')}px) {
          .${props.builderBlock.id}-breakpoints {
            flex-direction: var(--flex-dir);
            align-items: stretch;
          }

          .${props.builderBlock.id}-breakpoints > .builder-column {
            width: var(--column-width) !important;
            margin-left: var(--column-margin-left) !important;
          }
        },
      `;
    },
  });

  return (
    <div
      class={`builder-columns ${props.builderBlock.id}-breakpoints`}
      css={{
        display: 'flex',
        lineHeight: 'normal',
      }}
      style={state.columnsCssVars as CSS}
    >
      {/**
       * Need to use style tag for column and columns style instead of using the
       * respective 'style' or 'css' attributes because the rules now contain
       * "dynamic" media query values based on custom breakpoints.
       * Adding them directly otherwise leads to Mitosis and TS errors.
       */}
      <RenderInlinedStyles styles={state.columnsStyles} />

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
            }}
            key={index}
          >
            <RenderBlocks
              blocks={column.blocks}
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
