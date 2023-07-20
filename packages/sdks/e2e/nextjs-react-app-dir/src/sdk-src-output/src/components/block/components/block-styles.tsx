'use client';
import * as React from "react";

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
  const _context = { ...props["_context"] };

  const state = {
    processedBlock: getProcessedBlock({
      block: props.block,
      localState: props.context.localState,
      rootState: props.context.rootState,
      rootSetState: props.context.rootSetState,
      context: props.context.context,
      shouldEvaluateBindings: true,
    }),
    get canShowBlock() {
      // only render styles for blocks that are visible
      if (checkIsDefined(state.processedBlock.hide)) {
        return !state.processedBlock.hide;
      }
      if (checkIsDefined(state.processedBlock.show)) {
        return state.processedBlock.show;
      }
      return true;
    },
    get css() {
      const styles = state.processedBlock.responsiveStyles;
      const content = props.context.content;
      const sizesWithUpdatedBreakpoints = getSizesForBreakpoints(
        content?.meta?.breakpoints || {}
      );
      const largeStyles = styles?.large;
      const mediumStyles = styles?.medium;
      const smallStyles = styles?.small;
      const className = state.processedBlock.id;
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
    },
  };

  return (
    <>
      {TARGET !== "reactNative" && state.css && state.canShowBlock ? (
        <>
          <InlinedStyles styles={state.css} _context={_context} />
        </>
      ) : null}
    </>
  );
}

export default BlockStyles;
