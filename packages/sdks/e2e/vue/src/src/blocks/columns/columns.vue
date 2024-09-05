<template>
  <div
    :class="getColumnsClass(builderBlock?.id) + ' div-2brhoa1k8gd'"
    :style="columnsCssVars()"
    v-bind="{}"
  >
    <template v-if="TARGET !== 'reactNative'">
      <InlinedStyles
        id="builderio-columns"
        :styles="columnsStyles()"
        :nonce="builderContext.nonce"
      ></InlinedStyles>
    </template>

    <template :key="index" v-for="(column, index) in columns">
      <DynamicRenderer
        :TagName="getTagName(column)"
        :actionAttributes="{}"
        :attributes="getAttributes(column, index)"
        ><Blocks
          :path="`component.options.columns.${index}.blocks`"
          :parent="builderBlock.id"
          :styleProp="{
            flexGrow: '1',
          }"
          :context="builderContext"
          :registeredComponents="builderComponents"
          :linkComponent="builderLinkComponent"
          :blocks="column.blocks"
        ></Blocks
      ></DynamicRenderer>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import Blocks from "../../components/blocks/blocks.vue";
import DynamicDiv from "../../components/dynamic-div.vue";
import DynamicRenderer from "../../components/dynamic-renderer/dynamic-renderer.vue";
import InlinedStyles from "../../components/inlined-styles.vue";
import type { SizeName } from "../../constants/device-sizes";
import { getSizesForBreakpoints } from "../../constants/device-sizes";
import { TARGET } from "../../constants/target";
import { deoptSignal } from "../../functions/deopt";
import { getClassPropName } from "../../functions/get-class-prop-name";
import { mapStyleObjToStrIfNeeded } from "../../functions/get-style";
import type { Dictionary } from "../../types/typescript";
import type { Column, ColumnProps } from "./columns.types";
import { getColumnsClass } from "./helpers";

type CSSVal = string | number;

export default defineComponent({
  name: "builder-columns",
  components: {
    InlinedStyles: InlinedStyles,
    DynamicRenderer: DynamicRenderer,
    Blocks: Blocks,
    DynamicDiv: DynamicDiv,
  },
  props: [
    "space",
    "columns",
    "stackColumnsAt",
    "builderLinkComponent",
    "reverseColumnsWhenStacked",
    "builderContext",
    "builderBlock",
    "builderComponents",
  ],

  data() {
    return {
      gutterSize: typeof this.space === "number" ? this.space || 0 : 20,
      cols: this.columns || [],
      stackAt: this.stackColumnsAt || "tablet",
      flexDir:
        this.stackColumnsAt === "never"
          ? "row"
          : this.reverseColumnsWhenStacked
          ? "column-reverse"
          : "column",
      TARGET,
      getColumnsClass,
    };
  },

  methods: {
    getTagName(column: Column) {
      return column.link ? this.builderLinkComponent || "a" : "div";
    },
    getWidth(index: number) {
      return this.cols[index]?.width || 100 / this.cols.length;
    },
    getColumnCssWidth(index: number) {
      const width = this.getWidth(index);
      const subtractWidth =
        this.gutterSize * (this.cols.length - 1) * (width / 100);
      return `calc(${width}% - ${subtractWidth}px)`;
    },
    getTabletStyle({
      stackedStyle,
      desktopStyle,
    }: {
      stackedStyle: CSSVal;
      desktopStyle: CSSVal;
    }) {
      return this.stackAt === "tablet" ? stackedStyle : desktopStyle;
    },
    getMobileStyle({
      stackedStyle,
      desktopStyle,
    }: {
      stackedStyle: CSSVal;
      desktopStyle: CSSVal;
    }) {
      return this.stackAt === "never" ? desktopStyle : stackedStyle;
    },
    columnsCssVars() {
      return {
        "--flex-dir": this.flexDir,
        "--flex-dir-tablet": this.getTabletStyle({
          stackedStyle: this.flexDir,
          desktopStyle: "row",
        }),
      } as Dictionary<string>;
    },
    columnCssVars(index: number) {
      const gutter = index === 0 ? 0 : this.gutterSize;
      const width = this.getColumnCssWidth(index);
      const gutterPixels = `${gutter}px`;
      const mobileWidth = "100%";
      const mobileMarginLeft = 0;
      const marginLeftKey = "margin-left";
      const sharedStyles = {
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
      };
      return {
        ...sharedStyles,
        width,
        [marginLeftKey]: gutterPixels,
        "--column-width-mobile": this.getMobileStyle({
          stackedStyle: mobileWidth,
          desktopStyle: width,
        }),
        "--column-margin-left-mobile": this.getMobileStyle({
          stackedStyle: mobileMarginLeft,
          desktopStyle: gutterPixels,
        }),
        "--column-width-tablet": this.getTabletStyle({
          stackedStyle: mobileWidth,
          desktopStyle: width,
        }),
        "--column-margin-left-tablet": this.getTabletStyle({
          stackedStyle: mobileMarginLeft,
          desktopStyle: gutterPixels,
        }),
      } as Dictionary<string>;
    },
    getWidthForBreakpointSize(size: SizeName) {
      const breakpointSizes = getSizesForBreakpoints(
        this.builderContext.content?.meta?.breakpoints || {}
      );
      return breakpointSizes[size].max;
    },
    columnsStyles() {
      const childColumnDiv = `.${this.builderBlock.id}-breakpoints > .builder-column`;
      return `
        @media (max-width: ${this.getWidthForBreakpointSize("medium")}px) {
          .${this.builderBlock.id}-breakpoints {
            flex-direction: var(--flex-dir-tablet);
            align-items: stretch;
          }

          ${childColumnDiv} {
            width: var(--column-width-tablet) !important;
            margin-left: var(--column-margin-left-tablet) !important;
          }
        }

        @media (max-width: ${this.getWidthForBreakpointSize("small")}px) {
          .${this.builderBlock.id}-breakpoints {
            flex-direction: var(--flex-dir);
            align-items: stretch;
          }

          ${childColumnDiv} {
            width: var(--column-width-mobile) !important;
            margin-left: var(--column-margin-left-mobile) !important;
          }
        },
      `;
    },
    getAttributes(column: any, index: number) {
      return {
        ...{},
        ...(column.link
          ? {
              href: column.link,
            }
          : {}),
        [getClassPropName()]: "builder-column",
        style: mapStyleObjToStrIfNeeded(this.columnCssVars(index)),
      };
    },
  },
});
</script>

<style scoped>
.div-2brhoa1k8gd {
  display: flex;
  line-height: normal;
}
</style>