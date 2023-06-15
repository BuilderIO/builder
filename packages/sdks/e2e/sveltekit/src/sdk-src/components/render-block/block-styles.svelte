<script context="module" lang="ts">
  export type BlockStylesProps = {
    block: BuilderBlock;
    context: BuilderContextInterface;
  };
</script>

<script lang="ts">
  import {
    getMaxWidthQueryForSize,
    getSizesForBreakpoints,
  } from "../../constants/device-sizes.js";
  import { TARGET } from "../../constants/target.js";
  import type { BuilderContextInterface } from "../../context/types.js";
  import { getProcessedBlock } from "../../functions/get-processed-block.js";
  import { createCssClass } from "../../helpers/css.js";
  import { checkIsDefined } from "../../helpers/nullable.js";
  import type { BuilderBlock } from "../../types/builder-block.js";
  import RenderInlinedStyles from "../render-inlined-styles.svelte";

  export let block: BlockStylesProps["block"];
  export let context: BlockStylesProps["context"];

  $: useBlock = () => {
    return getProcessedBlock({
      block: block,
      localState: context.localState,
      rootState: context.rootState,
      rootSetState: context.rootSetState,
      context: context.context,
      shouldEvaluateBindings: true,
    });
  };
  $: canShowBlock = () => {
    // only render styles for blocks that are visible
    if (checkIsDefined(useBlock().hide)) {
      return !useBlock().hide;
    }
    if (checkIsDefined(useBlock().show)) {
      return useBlock().show;
    }
    return true;
  };
  $: css = () => {
    const styles = useBlock().responsiveStyles;
    const content = context.content;
    const sizesWithUpdatedBreakpoints = getSizesForBreakpoints(
      content?.meta?.breakpoints || {}
    );
    const largeStyles = styles?.large;
    const mediumStyles = styles?.medium;
    const smallStyles = styles?.small;
    const className = useBlock().id;
    if (!className) {
      return "";
    }
    const largeStylesClass = largeStyles
      ? createCssClass({
          className,
          styles: largeStyles,
        })
      : "";
    const mediumStylesClass = mediumStyles
      ? createCssClass({
          className,
          styles: mediumStyles,
          mediaQuery: getMaxWidthQueryForSize(
            "medium",
            sizesWithUpdatedBreakpoints
          ),
        })
      : "";
    const smallStylesClass = smallStyles
      ? createCssClass({
          className,
          styles: smallStyles,
          mediaQuery: getMaxWidthQueryForSize(
            "small",
            sizesWithUpdatedBreakpoints
          ),
        })
      : "";
    return [largeStylesClass, mediumStylesClass, smallStylesClass].join(" ");
  };
</script>

{#if TARGET !== "reactNative" && css() && canShowBlock()}
  <RenderInlinedStyles styles={css()} />
{/if}