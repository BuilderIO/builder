"use client";
import * as React from "react";
import { useState } from "react";

type CSSVal = string | number;
import Blocks from "../../components/blocks/blocks";
import InlinedStyles from "../../components/inlined-styles";
import type { SizeName } from "../../constants/device-sizes.js";
import { getSizesForBreakpoints } from "../../constants/device-sizes.js";
import { TARGET } from "../../constants/target.js";
import { deoptSignal } from "../../functions/deopt.js";
import type { PropsWithBuilderData } from "../../types/builder-props.js";
import type { Dictionary } from "../../types/typescript.js";
import type { ColumnProps } from "./columns.types.js";

function Columns(props: PropsWithBuilderData<ColumnProps>) {
  const [gutterSize, setGutterSize] = useState(() =>
    typeof props.space === "number" ? props.space || 0 : 20
  );

  const [cols, setCols] = useState(() => props.columns || []);

  const [stackAt, setStackAt] = useState(
    () => props.stackColumnsAt || "tablet"
  );

  function getWidth(index: number) {
    return cols[index]?.width || 100 / cols.length;
  }

  function getColumnCssWidth(index: number) {
    const subtractWidth = (gutterSize * (cols.length - 1)) / cols.length;
    return `calc(${getWidth(index)}% - ${subtractWidth}px)`;
  }

  function getTabletStyle({
    stackedStyle,
    desktopStyle,
  }: {
    stackedStyle: CSSVal;
    desktopStyle: CSSVal;
  }) {
    return stackAt === "tablet" ? stackedStyle : desktopStyle;
  }

  function getMobileStyle({
    stackedStyle,
    desktopStyle,
  }: {
    stackedStyle: CSSVal;
    desktopStyle: CSSVal;
  }) {
    return stackAt === "never" ? desktopStyle : stackedStyle;
  }

  const [flexDir, setFlexDir] = useState(() =>
    props.stackColumnsAt === "never"
      ? "row"
      : props.reverseColumnsWhenStacked
      ? "column-reverse"
      : "column"
  );

  function columnsCssVars() {
    return {
      "--flex-dir": flexDir,
      "--flex-dir-tablet": getTabletStyle({
        stackedStyle: flexDir,
        desktopStyle: "row",
      }),
    } as Dictionary<string>;
  }

  function columnCssVars(index: number) {
    const gutter = index === 0 ? 0 : gutterSize;
    const width = getColumnCssWidth(index);
    const gutterPixels = `${gutter}px`;
    const mobileWidth = "100%";
    const mobileMarginLeft = 0;
    const marginLeftKey = "marginLeft";
    return {
      width,
      [marginLeftKey]: gutterPixels,
      "--column-width-mobile": getMobileStyle({
        stackedStyle: mobileWidth,
        desktopStyle: width,
      }),
      "--column-margin-left-mobile": getMobileStyle({
        stackedStyle: mobileMarginLeft,
        desktopStyle: gutterPixels,
      }),
      "--column-width-tablet": getTabletStyle({
        stackedStyle: mobileWidth,
        desktopStyle: width,
      }),
      "--column-margin-left-tablet": getTabletStyle({
        stackedStyle: mobileMarginLeft,
        desktopStyle: gutterPixels,
      }),
    } as Dictionary<string>;
  }

  function getWidthForBreakpointSize(size: SizeName) {
    const breakpointSizes = getSizesForBreakpoints(
      props.builderContext.content?.meta?.breakpoints || {}
    );
    return breakpointSizes[size].max;
  }

  function columnsStyles() {
    return `
        @media (max-width: ${getWidthForBreakpointSize("medium")}px) {
          .${props.builderBlock.id}-breakpoints {
            flex-direction: var(--flex-dir-tablet);
            align-items: stretch;
          }

          .${props.builderBlock.id}-breakpoints > .builder-column {
            width: var(--column-width-tablet) !important;
            margin-left: var(--column-margin-left-tablet) !important;
          }
        }

        @media (max-width: ${getWidthForBreakpointSize("small")}px) {
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
  }

  return (
    <>
      <div
        className={
          `builder-columns ${props.builderBlock.id}-breakpoints` +
          " div-3c01d6ec"
        }
        style={columnsCssVars()}
        {...{}}
      >
        {TARGET !== "reactNative" ? (
          <>
            <InlinedStyles styles={columnsStyles()} />
          </>
        ) : null}

        {props.columns?.map((column, index) => (
          <div
            className="builder-column div-3c01d6ec-2"
            style={columnCssVars(index)}
            {...{}}
            key={index}
          >
            <Blocks
              path={`component.options.columns.${index}.blocks`}
              parent={props.builderBlock.id}
              styleProp={{
                flexGrow: "1",
              }}
              context={props.builderContext}
              registeredComponents={props.builderComponents}
              blocks={column.blocks}
            />
          </div>
        ))}
      </div>

      <style>{`.div-3c01d6ec {
  display: flex;
  line-height: normal;
}.div-3c01d6ec-2 {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}`}</style>
    </>
  );
}

export default Columns;
