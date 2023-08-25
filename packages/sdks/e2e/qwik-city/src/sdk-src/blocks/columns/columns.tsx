import Blocks from '../../components/blocks/blocks';

import InlinedStyles from '../../components/inlined-styles';

import {
  SizeName,
  getSizesForBreakpoints,
} from '../../constants/device-sizes.js';

import { TARGET } from '../../constants/target.js';

import { BuilderBlock } from '../../types/builder-block.js';

import {
  BuilderComponentsProp,
  PropsWithBuilderData,
} from '../../types/builder-props.js';

import { Dictionary } from '../../types/typescript.js';

import {
  Fragment,
  component$,
  h,
  useComputed$,
  useStore,
  useStylesScoped$,
} from '@builder.io/qwik';

type Column = {
  blocks: BuilderBlock[];
  width?: number;
};
type CSSVal = string | number;
type StackColumnsAt = 'tablet' | 'mobile' | 'never';
export interface ColumnProps extends BuilderComponentsProp {
  columns?: Column[];
  builderBlock: BuilderBlock;
  space?: number;
  stackColumnsAt?: StackColumnsAt;
  reverseColumnsWhenStacked?: boolean;
}
export const getWidth = function getWidth(props, state, index: number) {
  return state.cols[index]?.width || 100 / state.cols.length;
};
export const getColumnCssWidth = function getColumnCssWidth(
  props,
  state,
  index: number
) {
  const subtractWidth =
    (state.gutterSize * (state.cols.length - 1)) / state.cols.length;
  return `calc(${getWidth(props, state, index)}% - ${subtractWidth}px)`;
};
export const getTabletStyle = function getTabletStyle(
  props,
  state,
  {
    stackedStyle,
    desktopStyle,
  }: {
    stackedStyle: CSSVal;
    desktopStyle: CSSVal;
  }
) {
  return state.stackAt === 'tablet' ? stackedStyle : desktopStyle;
};
export const getMobileStyle = function getMobileStyle(
  props,
  state,
  {
    stackedStyle,
    desktopStyle,
  }: {
    stackedStyle: CSSVal;
    desktopStyle: CSSVal;
  }
) {
  return state.stackAt === 'never' ? desktopStyle : stackedStyle;
};
export const columnCssVars = function columnCssVars(
  props,
  state,
  index: number
) {
  const gutter = index === 0 ? 0 : state.gutterSize;
  const width = getColumnCssWidth(props, state, index);
  const gutterPixels = `${gutter}px`;
  const mobileWidth = '100%';
  const mobileMarginLeft = 0;
  const marginLeftKey = 'margin-left';
  return {
    width,
    [marginLeftKey]: gutterPixels,
    '--column-width-mobile': getMobileStyle(props, state, {
      stackedStyle: mobileWidth,
      desktopStyle: width,
    }),
    '--column-margin-left-mobile': getMobileStyle(props, state, {
      stackedStyle: mobileMarginLeft,
      desktopStyle: gutterPixels,
    }),
    '--column-width-tablet': getTabletStyle(props, state, {
      stackedStyle: mobileWidth,
      desktopStyle: width,
    }),
    '--column-margin-left-tablet': getTabletStyle(props, state, {
      stackedStyle: mobileMarginLeft,
      desktopStyle: gutterPixels,
    }),
  } as Dictionary<string>;
};
export const getWidthForBreakpointSize = function getWidthForBreakpointSize(
  props,
  state,
  size: SizeName
) {
  const breakpointSizes = getSizesForBreakpoints(
    props.builderContext.content?.meta?.breakpoints || {}
  );
  return breakpointSizes[size].max;
};
export const Columns = component$(
  (props: PropsWithBuilderData<ColumnProps>) => {
    const state = useStore<any>({
      cols: props.columns || [],
      flexDir:
        props.stackColumnsAt === 'never'
          ? 'row'
          : props.reverseColumnsWhenStacked
          ? 'column-reverse'
          : 'column',
      gutterSize: typeof props.space === 'number' ? props.space || 0 : 20,
      stackAt: props.stackColumnsAt || 'tablet',
    });
    useStylesScoped$(STYLES);

    const columnsCssVars = useComputed$(() => {
      return {
        '--flex-dir': state.flexDir,
        '--flex-dir-tablet': getTabletStyle(props, state, {
          stackedStyle: state.flexDir,
          desktopStyle: 'row',
        }),
      } as Dictionary<string>;
    });
    const columnsStyles = useComputed$(() => {
      return `
        @media (max-width: ${getWidthForBreakpointSize(
          props,
          state,
          'medium'
        )}px) {
          .${props.builderBlock.id}-breakpoints {
            flex-direction: var(--flex-dir-tablet);
            align-items: stretch;
          }

          .${props.builderBlock.id}-breakpoints > .builder-column {
            width: var(--column-width-tablet) !important;
            margin-left: var(--column-margin-left-tablet) !important;
          }
        }

        @media (max-width: ${getWidthForBreakpointSize(
          props,
          state,
          'small'
        )}px) {
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
    });
    return (
      <div
        class={
          `builder-columns ${props.builderBlock.id}-breakpoints` +
          ' div-Columns'
        }
        style={columnsCssVars.value}
        {...{}}
      >
        {TARGET !== 'reactNative' ? (
          <InlinedStyles styles={columnsStyles.value}></InlinedStyles>
        ) : null}
        {(props.columns || []).map((column, index) => {
          return (
            <div
              class="builder-column div-Columns-2"
              style={columnCssVars(props, state, index)}
              {...{}}
              key={index}
            >
              <Blocks
                blocks={column.blocks}
                path={`component.options.columns.${index}.blocks`}
                parent={props.builderBlock.id}
                styleProp={{
                  flexGrow: '1',
                }}
                context={props.builderContext}
                registeredComponents={props.builderComponents}
              ></Blocks>
            </div>
          );
        })}
      </div>
    );
  }
);

export default Columns;

export const STYLES = `
.div-Columns {
  display: flex;
  line-height: normal;
}
.div-Columns-2 {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
`;
