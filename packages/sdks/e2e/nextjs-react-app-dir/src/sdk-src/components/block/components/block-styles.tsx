"use client";
import * as React from "react";
import { useState } from "react";

export type BlockStylesProps = {
  block: BuilderBlock;
  context: BuilderContextInterface;
};
import {
  getMaxWidthQueryForSize,
  getSizesForBreakpoints,
} from "../../../constants/device-sizes";
import { TARGET } from "../../../constants/target";
import type { BuilderContextInterface } from "../../../context/types";
import { getProcessedBlock } from "../../../functions/get-processed-block";
import { createCssClass } from "../../../helpers/css";
import { checkIsDefined } from "../../../helpers/nullable";
import type { BuilderBlock } from "../../../types/builder-block";
import InlinedStyles from "../../inlined-styles";

function BlockStyles(props: BlockStylesProps) {
  const [processedBlock, setProcessedBlock] = useState(() =>
    getProcessedBlock({
      block: props.block,
      localState: props.context.localState,
      rootState: props.context.rootState,
      rootSetState: props.context.rootSetState,
      context: props.context.context,
      shouldEvaluateBindings: true,
    })
  );

  function canShowBlock() {
    // only render styles for blocks that are visible
    if (checkIsDefined(processedBlock.hide)) {
      return !processedBlock.hide;
    }
    if (checkIsDefined(processedBlock.show)) {
      return processedBlock.show;
    }
    return true;
  }

  function css() {
    const styles = processedBlock.responsiveStyles;
    const content = props.context.content;
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
  }

  return (
    <>
      {TARGET !== "reactNative" && css() && canShowBlock() ? (
        <>
          <InlinedStyles styles={css()} />
        </>
      ) : null}
    </>
  );
}

export default BlockStyles;
