import { Show, For, createSignal } from "solid-js";

import { css } from "solid-styled-components";

import Blocks from "../../components/blocks/blocks";
import { getSizesForBreakpoints } from "../../constants/device-sizes.js";
import InlinedStyles from "../../components/inlined-styles";
import { TARGET } from "../../constants/target.js";
import { deoptSignal } from "../../functions/deopt.js";

function Columns(props) {
  const [gutterSize, setGutterSize] = createSignal(
    typeof props.space === "number" ? props.space || 0 : 20
  );

  const [cols, setCols] = createSignal(props.columns || []);

  const [stackAt, setStackAt] = createSignal(props.stackColumnsAt || "tablet");

  const [flexDir, setFlexDir] = createSignal(
    props.stackColumnsAt === "never"
      ? "row"
      : props.reverseColumnsWhenStacked
      ? "column-reverse"
      : "column"
  );

  function getWidth(index) {
    return cols()[index]?.width || 100 / cols().length;
  }

  function getColumnCssWidth(index) {
    const subtractWidth = (gutterSize() * (cols().length - 1)) / cols().length;
    return `calc(${getWidth(index)}% - ${subtractWidth}px)`;
  }

  function getTabletStyle({ stackedStyle, desktopStyle }) {
    return stackAt() === "tablet" ? stackedStyle : desktopStyle;
  }

  function getMobileStyle({ stackedStyle, desktopStyle }) {
    return stackAt() === "never" ? desktopStyle : stackedStyle;
  }

  function columnsCssVars() {
    return {
      "--flex-dir": flexDir(),
      "--flex-dir-tablet": getTabletStyle({
        stackedStyle: flexDir(),
        desktopStyle: "row",
      }),
    };
  }

  function columnCssVars(index) {
    const gutter = index === 0 ? 0 : gutterSize();
    const width = getColumnCssWidth(index);
    const gutterPixels = `${gutter}px`;
    const mobileWidth = "100%";
    const mobileMarginLeft = 0;
    const marginLeftKey = "margin-left";
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
    };
  }

  function getWidthForBreakpointSize(size) {
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
    <div
      class={
        `builder-columns ${props.builderBlock.id}-breakpoints` +
        " " +
        css({
          display: "flex",
          lineHeight: "normal",
        })
      }
      style={columnsCssVars()}
      {...{}}
    >
      <Show when={TARGET !== "reactNative"}>
        <InlinedStyles styles={columnsStyles()}></InlinedStyles>
      </Show>
      <For each={props.columns}>
        {(column, _index) => {
          const index = _index();
          return (
            <div
              class={
                "builder-column " +
                css({
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "stretch",
                })
              }
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
              ></Blocks>
            </div>
          );
        }}
      </For>
    </div>
  );
}

export default Columns;
