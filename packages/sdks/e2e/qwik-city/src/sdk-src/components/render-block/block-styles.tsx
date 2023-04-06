import {
  getMaxWidthQueryForSize,
  getSizesForBreakpoints,
} from "../../constants/device-sizes.js";

import { TARGET } from "../../constants/target.js";

import { BuilderContextInterface } from "../../context/types.js";

import { getProcessedBlock } from "../../functions/get-processed-block.js";

import { createCssClass } from "../../helpers/css.js";

import { checkIsDefined } from "../../helpers/nullable.js";

import { BuilderBlock } from "../../types/builder-block.js";

import RenderInlinedStyles from "../render-inlined-styles";

import { Fragment, component$, h, useComputed$ } from "@builder.io/qwik";

export type BlockStylesProps = {
  block: BuilderBlock;
  context: BuilderContextInterface;
};
export const BlockStyles = component$((props: BlockStylesProps) => {
  const state: any = {};
  const useBlock = useComputed$(() => {
    return getProcessedBlock({
      block: props.block,
      state: props.context.state,
      context: props.context.context,
      shouldEvaluateBindings: true,
    });
  });
  const canShowBlock = useComputed$(() => {
    // only render styles for blocks that are visible
    if (checkIsDefined(useBlock.value.hide)) {
      return !useBlock.value.hide;
    }
    if (checkIsDefined(useBlock.value.show)) {
      return useBlock.value.show;
    }
    return true;
  });
  const css = useComputed$(() => {
    const styles = useBlock.value.responsiveStyles;
    const content = props.context.content;
    const sizesWithUpdatedBreakpoints = getSizesForBreakpoints(
      content?.meta?.breakpoints || {}
    );
    const largeStyles = styles?.large;
    const mediumStyles = styles?.medium;
    const smallStyles = styles?.small;
    const className = useBlock.value.id;
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
  });
  return (
    <>
      {TARGET !== "reactNative" && css.value && canShowBlock.value ? (
        <RenderInlinedStyles styles={css.value}></RenderInlinedStyles>
      ) : null}
    </>
  );
});

export default BlockStyles;
