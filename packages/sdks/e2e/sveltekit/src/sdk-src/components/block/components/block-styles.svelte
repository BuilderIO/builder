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
  } from "../../../constants/device-sizes.js";
  import { TARGET } from "../../../constants/target.js";
  import type { BuilderContextInterface } from "../../../context/types.js";
  import { getProcessedBlock } from "../../../functions/get-processed-block.js";
  import { createCssClass } from "../../../helpers/css.js";
  import { checkIsDefined } from "../../../helpers/nullable.js";
  import type { BuilderBlock } from "../../../types/builder-block.js";
  import InlinedStyles from "../../inlined-styles.svelte";

  export let block: BlockStylesProps["block"];
  export let context: BlockStylesProps["context"];

  $: canShowBlock = () => {
    // only render styles for blocks that are visible
    if (checkIsDefined(processedBlock.hide)) {
      return !processedBlock.hide;
    }
    if (checkIsDefined(processedBlock.show)) {
      return processedBlock.show;
    }
    return true;
  };
  $: css = () => {
    const styles = processedBlock.responsiveStyles;
    const content = context.content;
    const sizesWithUpdatedBreakpoints = getSizesForBreakpoints(
      content?.meta?.breakpoints || {}
    );
    const largeStyles = styles?.large;
    const mediumStyles = styles?.medium;
    const smallStyles = styles?.small;
    const className = processedBlock.id;
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

  let processedBlock = getProcessedBlock({
    block: block,
    localState: context.localState,
    rootState: context.rootState,
    rootSetState: context.rootSetState,
    context: context.context,
    shouldEvaluateBindings: true,
  });
</script>

{#if TARGET !== "reactNative" && css() && canShowBlock()}
  <InlinedStyles styles={css()} />
{/if}