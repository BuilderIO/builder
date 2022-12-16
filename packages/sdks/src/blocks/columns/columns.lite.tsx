import RenderBlocks from '../../components/render-blocks.lite';
import { For, Show, useStore } from '@builder.io/mitosis';
import type { BuilderBlock } from '../../types/builder-block';
import { getSizesForBreakpoints } from '../../constants/device-sizes';
import type { SizeName } from '../../constants/device-sizes';
import type { Breakpoints } from '../../types/builder-content';
import RenderInlinedStyles from '../../components/render-inlined-styles.lite';
import { TARGET } from '../../constants/target.js';
import { convertStyleMapToCSS } from '../../helpers/css';

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

    get columnStyleObjects() {
      return {
        columns: {
          small: {
            flexDirection: 'var(--flex-dir)',
            alignItems: 'stretch',
          },
          medium: {
            flexDirection: 'var(--flex-dir-tablet)',
            alignItems: 'stretch',
          },
        },
        column: {
          small: {
            width: 'var(--column-width) !important',
            marginLeft: 'var(--column-margin-left) !important',
          },
          medium: {
            width: 'var(--column-width-tablet) !important',
            marginLeft: 'var(--column-margin-left-tablet) !important',
          },
        },
      };
    },

    get columnsStyles(): string {
      return `
        @media (max-width: ${state.getWidthForBreakpointSize('medium')}px) {
          .${props.builderBlock.id}-breakpoints {
            ${convertStyleMapToCSS(state.columnStyleObjects.columns.medium)}
          }

          .${props.builderBlock.id}-breakpoints > .builder-column {
            ${convertStyleMapToCSS(state.columnStyleObjects.column.medium)}
          }
        }

        @media (max-width: ${state.getWidthForBreakpointSize('small')}px) {
          .${props.builderBlock.id}-breakpoints {
            ${convertStyleMapToCSS(state.columnStyleObjects.columns.small)}
          }

          .${props.builderBlock.id}-breakpoints > .builder-column {
            ${convertStyleMapToCSS(state.columnStyleObjects.column.small)}
          }
        },
      `;
    },

    get reactNativeColumnsStyles() {
      return this.columnStyleObjects.columns.small;
    },
    get reactNativeColumnStyles() {
      return this.columnStyleObjects.column.small;
    },
  });

  return (
    <div
      class={`builder-columns ${props.builderBlock.id}-breakpoints`}
      css={{
        display: 'flex',
        lineHeight: 'normal',
      }}
      style={{
        ...(TARGET === 'reactNative' ? state.reactNativeColumnsStyles : {}),
        ...state.columnsCssVars,
      }}
    >
      <Show when={TARGET !== 'reactNative'}>
        {/**
         * Need to use style tag for column and columns style instead of using the
         * respective 'style' or 'css' attributes because the rules now contain
         * "dynamic" media query values based on custom breakpoints.
         * Adding them directly otherwise leads to Mitosis and TS errors.
         */}
        <RenderInlinedStyles styles={state.columnsStyles} />
      </Show>

      <For each={props.columns}>
        {(column, index) => (
          <div
            style={{
              width: state.getColumnCssWidth(index),
              marginLeft: `${index === 0 ? 0 : state.getGutterSize()}px`,
              ...(TARGET === 'reactNative'
                ? state.reactNativeColumnStyles
                : {}),
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
