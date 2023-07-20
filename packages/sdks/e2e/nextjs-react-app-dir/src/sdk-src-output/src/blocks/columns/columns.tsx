'use client';
import * as React from "react";

type Column = {
  blocks: BuilderBlock[];
  width?: number;
};
type CSSVal = string | number;
type StackColumnsAt = "tablet" | "mobile" | "never";
export interface ColumnProps extends BuilderComponentsProp {
  columns?: Column[];
  builderBlock: BuilderBlock;
  space?: number;
  stackColumnsAt?: StackColumnsAt;
  reverseColumnsWhenStacked?: boolean;
}

import Blocks from "../../components/blocks/blocks";
import type { BuilderBlock } from "../../types/builder-block";
import { getSizesForBreakpoints } from "../../constants/device-sizes";
import type { SizeName } from "../../constants/device-sizes";
import InlinedStyles from "../../components/inlined-styles";
import { TARGET } from "../../constants/target";
import BuilderContext from "../../context/builder.context.js";
import type { Dictionary } from "../../types/typescript";
import type {
  BuilderComponentsProp,
  PropsWithBuilderData,
} from "../../types/builder-props";

function Columns(props: PropsWithBuilderData<ColumnProps>) {
  const _context = { ...props["_context"] };

  const state = {
    gutterSize: typeof props.space === "number" ? props.space || 0 : 20,
    cols: props.columns || [],
    stackAt: props.stackColumnsAt || "tablet",
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
    }) {
      return state.stackAt === "tablet" ? stackedStyle : desktopStyle;
    },
    getMobileStyle({
      stackedStyle,
      desktopStyle,
    }: {
      stackedStyle: CSSVal;
      desktopStyle: CSSVal;
    }) {
      return state.stackAt === "never" ? desktopStyle : stackedStyle;
    },
    flexDir:
      props.stackColumnsAt === "never"
        ? "row"
        : props.reverseColumnsWhenStacked
        ? "column-reverse"
        : "column",
    get columnsCssVars() {
      if (TARGET === "reactNative") {
        return {
          flexDirection: state.flexDir,
        } as Dictionary<string>;
      }
      return {
        "--flex-dir": state.flexDir,
        "--flex-dir-tablet": state.getTabletStyle({
          stackedStyle: state.flexDir,
          desktopStyle: "row",
        }),
      } as Dictionary<string>;
    },
    columnCssVars(index: number) {
      const gutter = index === 0 ? 0 : state.gutterSize;
      if (TARGET === "reactNative") {
        return {
          marginLeft: props.stackColumnsAt === "never" ? gutter : 0,
        } as any as Dictionary<string>;
      }
      const width = state.getColumnCssWidth(index);
      const gutterPixels = `${gutter}px`;
      const mobileWidth = "100%";
      const mobileMarginLeft = 0;
      const marginLeftKey = TARGET === "react" ? "marginLeft" : "margin-left";
      return {
        width,
        [marginLeftKey]: gutterPixels,
        "--column-width-mobile": state.getMobileStyle({
          stackedStyle: mobileWidth,
          desktopStyle: width,
        }),
        "--column-margin-left-mobile": state.getMobileStyle({
          stackedStyle: mobileMarginLeft,
          desktopStyle: gutterPixels,
        }),
        "--column-width-tablet": state.getTabletStyle({
          stackedStyle: mobileWidth,
          desktopStyle: width,
        }),
        "--column-margin-left-tablet": state.getTabletStyle({
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
    get columnsStyles() {
      return `
        @media (max-width: ${state.getWidthForBreakpointSize("medium")}px) {
          .${props.builderBlock.id}-breakpoints {
            flex-direction: var(--flex-dir-tablet);
            align-items: stretch;
          }

          .${props.builderBlock.id}-breakpoints > .builder-column {
            width: var(--column-width-tablet) !important;
            margin-left: var(--column-margin-left-tablet) !important;
          }
        }

        @media (max-width: ${state.getWidthForBreakpointSize("small")}px) {
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
  };

  const builderContext = _context["BuilderContext"];

  return (
    <>
      <div
        className={
          `builder-columns ${props.builderBlock.id}-breakpoints` +
          " div-e83c2702"
        }
        style={state.columnsCssVars}
      >
        {TARGET !== "reactNative" ? (
          <>
            <InlinedStyles styles={state.columnsStyles} _context={_context} />
          </>
        ) : null}

        {props.columns?.map((column, index) => (
          <div
            className="builder-column div-e83c2702-2"
            style={state.columnCssVars(index)}
            key={index}
          >
            <Blocks
              blocks={column.blocks}
              path={`component.options.columns.${index}.blocks`}
              parent={props.builderBlock.id}
              styleProp={{
                flexGrow: "1",
              }}
              context={builderContext}
              registeredComponents={props.builderComponents}
              _context={_context}
            />
          </div>
        ))}
      </div>

      <style>{`.div-e83c2702 {
  display: flex;
  line-height: normal;
}.div-e83c2702-2 {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}`}</style>
    </>
  );
}

export default Columns;
