<script context="module" lang="ts">
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
</script>

<script lang="ts">
  import Blocks from "../../components/blocks/blocks.svelte";
  import type { BuilderBlock } from "../../types/builder-block.js";
  import { getSizesForBreakpoints } from "../../constants/device-sizes.js";
  import type { SizeName } from "../../constants/device-sizes.js";
  import InlinedStyles from "../../components/inlined-styles.svelte";
  import { TARGET } from "../../constants/target.js";
  import type { Dictionary } from "../../types/typescript.js";
  import type {
    BuilderComponentsProp,
    PropsWithBuilderData,
  } from "../../types/builder-props.js";

  export let js: PropsWithBuilderData<ColumnProps>["js"];
  export let space: PropsWithBuilderData<ColumnProps>["space"];
  export let columns: PropsWithBuilderData<ColumnProps>["columns"];
  export let stackColumnsAt: PropsWithBuilderData<ColumnProps>["stackColumnsAt"];
  export let reverseColumnsWhenStacked: PropsWithBuilderData<ColumnProps>["reverseColumnsWhenStacked"];
  export let builderContext: PropsWithBuilderData<ColumnProps>["builderContext"];
  export let builderBlock: PropsWithBuilderData<ColumnProps>["builderBlock"];
  export let builderComponents: PropsWithBuilderData<ColumnProps>["builderComponents"];

  function mitosis_styling(node, vars) {
    Object.entries(vars || {}).forEach(([p, v]) => {
      if (p.startsWith("--")) {
        node.style.setProperty(p, v);
      } else {
        node.style[p] = v;
      }
    });
  }

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
  function columnCssVars(index: number) {
    const gutter = index === 0 ? 0 : gutterSize;
    if (TARGET === "reactNative") {
      return {
        marginLeft: stackColumnsAt === "never" ? gutter : 0,
      } as any as Dictionary<string>;
    }
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
    } as any as Dictionary<string>;
  }
  function getWidthForBreakpointSize(size: SizeName) {
    const breakpointSizes = getSizesForBreakpoints(
      $builderContext.content?.meta?.breakpoints || {}
    );
    return breakpointSizes[size].max;
  }
  $: columnsCssVars = () => {
    return {
      "--flex-dir": flexDir,
      "--flex-dir-tablet": getTabletStyle({
        stackedStyle: flexDir,
        desktopStyle: "row",
      }),
    } as Dictionary<string>;
  };
  $: columnsStyles = () => {
    return `
        @media (max-width: ${getWidthForBreakpointSize("medium")}px) {
          .${builderBlock.id}-breakpoints {
            flex-direction: var(--flex-dir-tablet);
            align-items: stretch;
          }

          .${builderBlock.id}-breakpoints > .builder-column {
            width: var(--column-width-tablet) !important;
            margin-left: var(--column-margin-left-tablet) !important;
          }
        }

        @media (max-width: ${getWidthForBreakpointSize("small")}px) {
          .${builderBlock.id}-breakpoints {
            flex-direction: var(--flex-dir);
            align-items: stretch;
          }

          .${builderBlock.id}-breakpoints > .builder-column {
            width: var(--column-width-mobile) !important;
            margin-left: var(--column-margin-left-mobile) !important;
          }
        },
      `;
  };

  let gutterSize = typeof space === "number" ? space || 0 : 20;
  let cols = columns || [];
  let stackAt = stackColumnsAt || "tablet";
  let flexDir =
    stackColumnsAt === "never"
      ? "row"
      : reverseColumnsWhenStacked
      ? "column-reverse"
      : "column";
</script>

<div
  use:mitosis_styling={columnsCssVars()}
  class={`builder-columns ${builderBlock.id}-breakpoints` + " div"}
  {...{}}
>
  {#if TARGET !== "reactNative"}
    <InlinedStyles styles={columnsStyles()} />
  {/if}

  {#each columns as column, index (index)}
    <div
      use:mitosis_styling={columnCssVars(index)}
      class="builder-column div-2"
      {...{}}
    >
      <Blocks
        blocks={column.blocks}
        path={`component.options.columns.${index}.blocks`}
        parent={builderBlock.id}
        styleProp={{
          flexGrow: "1",
        }}
        context={builderContext}
        registeredComponents={builderComponents}
      />
    </div>
  {/each}
</div>

<style>
  .div {
    display: flex;
    line-height: normal;
  }
  .div-2 {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }
</style>