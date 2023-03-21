import RenderBlocks from '../../components/render-blocks.lite';
import { For, Show, useContext, useStore } from '@builder.io/mitosis';
import type { BuilderBlock } from '../../types/builder-block';
import { getSizesForBreakpoints } from '../../constants/device-sizes';
import type { SizeName } from '../../constants/device-sizes';
import RenderInlinedStyles from '../../components/render-inlined-styles.lite';
import { TARGET } from '../../constants/target.js';
import BuilderContext from '../../context/builder.context.lite';
import type { Dictionary } from '../../types/typescript';

type Column = {
  blocks: BuilderBlock[];
  width?: number;
};

type CSSVal = string | number;

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
  const builderContext = useContext(BuilderContext);

  const state = useStore({
    gutterSize: typeof props.space === 'number' ? props.space || 0 : 20,
    cols: props.columns || [],
    stackAt: props.stackColumnsAt || 'tablet',
    getWidth(index: number) {
      return state.cols[index]?.width || 100 / state.cols.length;
    },
    getColumnCssWidth(index: number) {
      const subtractWidth =
        (state.gutterSize * (state.cols.length - 1)) / state.cols.length;
      return `calc(${state.getWidth(index)}% - ${subtractWidth}px)`;
    },

    getTabletStyle({
      stackedStyle,
      desktopStyle,
    }: {
      stackedStyle: CSSVal;
      desktopStyle: CSSVal;
    }): CSSVal {
      return state.stackAt === 'tablet' ? stackedStyle : desktopStyle;
    },

    getMobileStyle({
      stackedStyle,
      desktopStyle,
    }: {
      stackedStyle: CSSVal;
      desktopStyle: CSSVal;
    }): CSSVal {
      return state.stackAt === 'never' ? desktopStyle : stackedStyle;
    },

    flexDir:
      props.stackColumnsAt === 'never'
        ? 'row'
        : props.reverseColumnsWhenStacked
        ? 'column-reverse'
        : 'column',

    get columnsCssVars(): Dictionary<string> {
      if (TARGET === 'reactNative') {
        return {
          flexDirection: state.flexDir,
        } as Dictionary<string>;
      }

      return {
        '--flex-dir': state.flexDir,
        '--flex-dir-tablet': state.getTabletStyle({
          stackedStyle: state.flexDir,
          desktopStyle: 'row',
        }),
      } as Dictionary<string>;
    },

    columnCssVars(index: number): Dictionary<string> {
      const gutter = index === 0 ? 0 : state.gutterSize;

      if (TARGET === 'reactNative') {
        return {
          marginLeft: props.stackColumnsAt === 'never' ? gutter : 0,
        } as any as Dictionary<string>;
      }

      const width = state.getColumnCssWidth(index);
      const gutterPixels = `${state.gutterSize}px`;
      const mobileWidth = '100%';
      const mobileMarginLeft = 0;

      return {
        width,
        'margin-left': gutterPixels,
        '--column-width-mobile': state.getMobileStyle({
          stackedStyle: mobileWidth,
          desktopStyle: width,
        }),
        '--column-margin-left-mobile': state.getMobileStyle({
          stackedStyle: mobileMarginLeft,
          desktopStyle: gutterPixels,
        }),
        '--column-width-tablet': state.getTabletStyle({
          stackedStyle: mobileWidth,
          desktopStyle: width,
        }),
        '--column-margin-left-tablet': state.getTabletStyle({
          stackedStyle: mobileMarginLeft,
          desktopStyle: gutterPixels,
        }),
      } as any as Dictionary<string>;
    },

    getWidthForBreakpointSize(size: SizeName) {
      const breakpointSizes = getSizesForBreakpoints(
        builderContext.content?.meta?.breakpoints || {}
      );

      return breakpointSizes[size].max;
    },

    get columnsStyles(): string {
      return `
        @media (max-width: ${state.getWidthForBreakpointSize('medium')}px) {
          .${props.builderBlock.id}-breakpoints {
            flex-direction: var(--flex-dir-tablet);
            align-items: stretch;
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
            width: var(--column-width-mobile) !important;
            margin-left: var(--column-margin-left-mobile) !important;
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
      style={state.columnsCssVars}
      dataSet={{ 'builder-block-name': 'builder-columns' }}
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
            style={state.columnCssVars(index)}
            class="builder-column"
            dataSet={{ 'builder-block-name': 'builder-column' }}
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
