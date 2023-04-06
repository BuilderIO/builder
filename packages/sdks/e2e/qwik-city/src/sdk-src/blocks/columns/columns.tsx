import RenderBlocks from "../../components/render-blocks";

import RenderInlinedStyles from "../../components/render-inlined-styles";

import { SizeName, getSizesForBreakpoints } from "../../constants/device-sizes";

import { TARGET } from "../../constants/target.js";

import BuilderContext from "../../context/builder.context";

import { BuilderBlock } from "../../types/builder-block";

import { Dictionary } from "../../types/typescript";

import {
  Fragment,
  component$,
  h,
  useComputed$,
  useContext,
  useStore,
  useStylesScoped$,
} from "@builder.io/qwik";

type Column = {
  blocks: BuilderBlock[];
  width?: number;
};
type CSSVal = string | number;
type StackColumnsAt = "tablet" | "mobile" | "never";
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
export const getWidth = function getWidth(
  props,
  state,
  builderContext,
  index: number
) {
  return state.cols[index]?.width || 100 / state.cols.length;
};
export const getColumnCssWidth = function getColumnCssWidth(
  props,
  state,
  builderContext,
  index: number
) {
  const subtractWidth =
    (state.gutterSize * (state.cols.length - 1)) / state.cols.length;
  return `calc(${getWidth(
    props,
    state,
    builderContext,
    index
  )}% - ${subtractWidth}px)`;
};
export const getTabletStyle = function getTabletStyle(
  props,
  state,
  builderContext,
  {
    stackedStyle,
    desktopStyle,
  }: {
    stackedStyle: CSSVal;
    desktopStyle: CSSVal;
  }
) {
  return state.stackAt === "tablet" ? stackedStyle : desktopStyle;
};
export const getMobileStyle = function getMobileStyle(
  props,
  state,
  builderContext,
  {
    stackedStyle,
    desktopStyle,
  }: {
    stackedStyle: CSSVal;
    desktopStyle: CSSVal;
  }
) {
  return state.stackAt === "never" ? desktopStyle : stackedStyle;
};
export const columnCssVars = function columnCssVars(
  props,
  state,
  builderContext,
  index: number
) {
  const gutter = index === 0 ? 0 : state.gutterSize;
  if (TARGET === "reactNative") {
    return {
      marginLeft: props.stackColumnsAt === "never" ? gutter : 0,
    } as any as Dictionary<string>;
  }
  const width = getColumnCssWidth(props, state, builderContext, index);
  const gutterPixels = `${state.gutterSize}px`;
  const mobileWidth = "100%";
  const mobileMarginLeft = 0;
  return {
    width,
    "margin-left": gutterPixels,
    "--column-width-mobile": getMobileStyle(props, state, builderContext, {
      stackedStyle: mobileWidth,
      desktopStyle: width,
    }),
    "--column-margin-left-mobile": getMobileStyle(
      props,
      state,
      builderContext,
      {
        stackedStyle: mobileMarginLeft,
        desktopStyle: gutterPixels,
      }
    ),
    "--column-width-tablet": getTabletStyle(props, state, builderContext, {
      stackedStyle: mobileWidth,
      desktopStyle: width,
    }),
    "--column-margin-left-tablet": getTabletStyle(
      props,
      state,
      builderContext,
      {
        stackedStyle: mobileMarginLeft,
        desktopStyle: gutterPixels,
      }
    ),
  } as any as Dictionary<string>;
};
export const getWidthForBreakpointSize = function getWidthForBreakpointSize(
  props,
  state,
  builderContext,
  size: SizeName
) {
  const breakpointSizes = getSizesForBreakpoints(
    builderContext.content?.meta?.breakpoints || {}
  );
  return breakpointSizes[size].max;
};
export const Columns = component$((props: ColumnProps) => {
  useStylesScoped$(STYLES);

  const builderContext = useContext(BuilderContext);
  const state = useStore<any>({
    cols: props.columns || [],
    flexDir:
      props.stackColumnsAt === "never"
        ? "row"
        : props.reverseColumnsWhenStacked
        ? "column-reverse"
        : "column",
    gutterSize: typeof props.space === "number" ? props.space || 0 : 20,
    stackAt: props.stackColumnsAt || "tablet",
  });
  const columnsCssVars = useComputed$(() => {
    if (TARGET === "reactNative") {
      return {
        flexDirection: state.flexDir,
      } as Dictionary<string>;
    }
    return {
      "--flex-dir": state.flexDir,
      "--flex-dir-tablet": getTabletStyle(props, state, builderContext, {
        stackedStyle: state.flexDir,
        desktopStyle: "row",
      }),
    } as Dictionary<string>;
  });
  const columnsStyles = useComputed$(() => {
    return `
        @media (max-width: ${getWidthForBreakpointSize(
          props,
          state,
          builderContext,
          "medium"
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
          builderContext,
          "small"
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
        `builder-columns ${props.builderBlock.id}-breakpoints` + " div-Columns"
      }
      style={columnsCssVars.value}
    >
      {TARGET !== "reactNative" ? (
        <RenderInlinedStyles styles={columnsStyles.value}></RenderInlinedStyles>
      ) : null}
      {(props.columns || []).map(function (column, index) {
        return (
          <div
            class="builder-column div-Columns-2"
            style={columnCssVars(props, state, builderContext, index)}
            key={index}
          >
            <RenderBlocks
              blocks={column.blocks}
              path={`component.options.columns.${index}.blocks`}
              parent={props.builderBlock.id}
              styleProp={{
                flexGrow: "1",
              }}
            ></RenderBlocks>
          </div>
        );
      })}
    </div>
  );
});

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
