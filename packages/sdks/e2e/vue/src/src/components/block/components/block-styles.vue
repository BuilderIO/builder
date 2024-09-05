<template>
  <template v-if="TARGET !== 'reactNative' && css && canShowBlock">
    <InlinedStyles
      id="builderio-block"
      :styles="css"
      :nonce="context.nonce"
    ></InlinedStyles>
  </template>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import {
  getMaxWidthQueryForSize,
  getSizesForBreakpoints,
} from "../../../constants/device-sizes";
import { TARGET } from "../../../constants/target";
import type { BuilderContextInterface } from "../../../context/types";
import { camelToKebabCase } from "../../../functions/camel-to-kebab-case";
import { createCssClass } from "../../../helpers/css";
import { checkIsDefined } from "../../../helpers/nullable";
import type { BuilderBlock } from "../../../types/builder-block";
import InlinedStyles from "../../inlined-styles.vue";

export type BlockStylesProps = {
  block: BuilderBlock;
  context: BuilderContextInterface;
};

export default defineComponent({
  name: "block-styles",
  components: { InlinedStyles: InlinedStyles },
  props: ["block", "context"],

  data() {
    return { TARGET };
  },

  computed: {
    canShowBlock() {
      const processedBlock = this.block;
      // only render styles for blocks that are visible
      if (checkIsDefined(processedBlock.hide)) {
        return !processedBlock.hide;
      }
      if (checkIsDefined(processedBlock.show)) {
        return processedBlock.show;
      }
      return true;
    },
    css() {
      const processedBlock = this.block;
      const styles = processedBlock.responsiveStyles;
      const content = this.context.content;
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
      const hoverAnimation =
        processedBlock.animations &&
        processedBlock.animations.find((item) => item.trigger === "hover");
      let hoverStylesClass = "";
      if (hoverAnimation) {
        const hoverStyles = hoverAnimation.steps?.[1]?.styles || {};
        hoverStylesClass =
          createCssClass({
            className: `${className}:hover`,
            styles: {
              ...hoverStyles,
              transition: `all ${hoverAnimation.duration}s ${camelToKebabCase(
                hoverAnimation.easing
              )}`,
              transitionDelay: hoverAnimation.delay
                ? `${hoverAnimation.delay}s`
                : "0s",
            },
          }) || "";
      }
      return [
        largeStylesClass,
        mediumStylesClass,
        smallStylesClass,
        hoverStylesClass,
      ].join(" ");
    },
  },
});
</script>