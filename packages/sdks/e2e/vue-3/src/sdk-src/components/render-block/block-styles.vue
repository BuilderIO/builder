<template>
  <template v-if="TARGET !== 'reactNative' && css && canShowBlock">
    <render-inlined-styles :styles="css"></render-inlined-styles>
  </template>
</template>

<script lang="ts">
import { defineComponent } from "vue";

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
import RenderInlinedStyles from "../render-inlined-styles.vue";

export type BlockStylesProps = {
  block: BuilderBlock;
  context: BuilderContextInterface;
};

export default defineComponent({
  name: "block-styles",
  components: { RenderInlinedStyles: RenderInlinedStyles },
  props: ["block", "context"],

  data() {
    return { TARGET };
  },

  computed: {
    useBlock() {
      return getProcessedBlock({
        block: this.block,
        localState: this.context.localState,
        rootState: this.context.rootState,
        rootSetState: this.context.rootSetState,
        context: this.context.context,
        shouldEvaluateBindings: true,
      });
    },
    canShowBlock() {
      // only render styles for blocks that are visible
      if (checkIsDefined(this.useBlock.hide)) {
        return !this.useBlock.hide;
      }
      if (checkIsDefined(this.useBlock.show)) {
        return this.useBlock.show;
      }
      return true;
    },
    css() {
      const styles = this.useBlock.responsiveStyles;
      const content = this.context.content;
      const sizesWithUpdatedBreakpoints = getSizesForBreakpoints(
        content?.meta?.breakpoints || {}
      );
      const largeStyles = styles?.large;
      const mediumStyles = styles?.medium;
      const smallStyles = styles?.small;
      const className = this.useBlock.id;
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
  },
});
</script>