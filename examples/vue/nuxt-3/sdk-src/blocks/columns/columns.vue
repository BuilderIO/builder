<template>
  <div
    :class="
      _classStringToObject(
        `builder-columns ${builderBlock.id}-breakpoints` + ' div-1yj9n7yt24z'
      )
    "
    :style="columnsCssVars"
    :dataSet="{
      'builder-block-name': 'builder-columns',
    }"
  >
    <template v-if="TARGET !== 'reactNative'">
      <render-inlined-styles :styles="columnsStyles"></render-inlined-styles>
    </template>

    <template :key="index" v-for="(column, index) in columns">
      <div
        class="builder-column div-1yj9n7yt24z-2"
        :style="columnCssVars(index)"
        :dataSet="{
          'builder-block-name': 'builder-column',
        }"
      >
        <render-blocks
          :blocks="column.blocks"
          :path="`component.options.columns.${index}.blocks`"
          :parent="builderBlock.id"
          :styleProp="{
            flexGrow: '1',
          }"
        ></render-blocks>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import RenderBlocks from "../../components/render-blocks.vue";
import type { BuilderBlock } from "../../types/builder-block";
import { getSizesForBreakpoints } from "../../constants/device-sizes";
import type { SizeName } from "../../constants/device-sizes";
import RenderInlinedStyles from "../../components/render-inlined-styles.vue";
import { TARGET } from "../../constants/target.js";
import BuilderContext from "../../context/builder.context.js";
import type { Dictionary } from "../../types/typescript";

type Column = {
  blocks: BuilderBlock[];
  width?: number;
};
type CSSVal = string | number;
type StackColumnsAt = "tablet" | "mobile" | "never";
export interface ColumnProps {
  columns?: Column[];
  builderBlock: BuilderBlock;
  space?: number;
  stackColumnsAt?: StackColumnsAt;
  reverseColumnsWhenStacked?: boolean;
}

export default defineComponent({
  name: "builder-columns",
  components: {
    RenderInlinedStyles: RenderInlinedStyles,
    RenderBlocks: RenderBlocks,
  },
  props: [
    "space",
    "columns",
    "stackColumnsAt",
    "reverseColumnsWhenStacked",
    "builderBlock",
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
    };
  },

  inject: {
    builderContext: BuilderContext.key,
  },

  computed: {
    columnsCssVars() {
      if (TARGET === "reactNative") {
        return {
          flexDirection: this.flexDir,
        } as Dictionary<string>;
      }
      return {
        "--flex-dir": this.flexDir,
        "--flex-dir-tablet": this.getTabletStyle({
          stackedStyle: this.flexDir,
          desktopStyle: "row",
        }),
      } as Dictionary<string>;
    },
    columnsStyles() {
      return `
        @media (max-width: ${this.getWidthForBreakpointSize("medium")}px) {
          .${this.builderBlock.id}-breakpoints {
            flex-direction: var(--flex-dir-tablet);
            align-items: stretch;
          }

          .${this.builderBlock.id}-breakpoints > .builder-column {
            width: var(--column-width-tablet) !important;
            margin-left: var(--column-margin-left-tablet) !important;
          }
        }

        @media (max-width: ${this.getWidthForBreakpointSize("small")}px) {
          .${this.builderBlock.id}-breakpoints {
            flex-direction: var(--flex-dir);
            align-items: stretch;
          }

          .${this.builderBlock.id}-breakpoints > .builder-column {
            width: var(--column-width-mobile) !important;
            margin-left: var(--column-margin-left-mobile) !important;
          }
        },
      `;
    },
  },

  methods: {
    getWidth(index: number) {
      return this.cols[index]?.width || 100 / this.cols.length;
    },
    getColumnCssWidth(index: number) {
      const subtractWidth =
        (this.gutterSize * (this.cols.length - 1)) / this.cols.length;
      return `calc(${this.getWidth(index)}% - ${subtractWidth}px)`;
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
    columnCssVars(index: number) {
      const gutter = index === 0 ? 0 : this.gutterSize;
      if (TARGET === "reactNative") {
        return {
          marginLeft: this.stackColumnsAt === "never" ? gutter : 0,
        } as any as Dictionary<string>;
      }
      const width = this.getColumnCssWidth(index);
      const gutterPixels = `${gutter}px`;
      const mobileWidth = "100%";
      const mobileMarginLeft = 0;
      return {
        width,
        "margin-left": gutterPixels,
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
      } as any as Dictionary<string>;
    },
    getWidthForBreakpointSize(size: SizeName) {
      const breakpointSizes = getSizesForBreakpoints(
        this.builderContext.content?.meta?.breakpoints || {}
      );
      return breakpointSizes[size].max;
    },
    _classStringToObject(str: string) {
      const obj: Record<string, boolean> = {};
      if (typeof str !== "string") {
        return obj;
      }
      const classNames = str.trim().split(/\s+/);
      for (const name of classNames) {
        obj[name] = true;
      }
      return obj;
    },
  },
});
</script>

<style scoped>
.div-1yj9n7yt24z {
  display: flex;
  line-height: normal;
}
.div-1yj9n7yt24z-2 {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
</style>