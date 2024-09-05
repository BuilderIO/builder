<template>
  <component
    ref="blocksWrapperRef"
    :class="className + ' component-178o76acnws'"
    :builder-path="path"
    :builder-parent-id="parent"
    :style="styleProp"
    :onClick="(event) => onClick()"
    :onMouseEnter="(event) => onMouseEnter()"
    :onKeyPress="(event) => onClick()"
    :is="BlocksWrapper"
    v-bind="{ ...{}, ...BlocksWrapperProps }"
    ><slot
  /></component>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { isEditing } from "../../functions/is-editing";
import type { BuilderBlock } from "../../types/builder-block";

export type BlocksWrapperProps = {
  blocks: BuilderBlock[] | undefined;
  parent: string | undefined;
  path: string | undefined;
  styleProp: Record<string, any> | undefined;
  /**
   * The element that wraps each list of blocks. Defaults to a `div` element ('ScrollView' in React Native).
   */
  BlocksWrapper: any;
  /**
   * Additonal props to pass to `blocksWrapper`. Defaults to `{}`.
   */
  BlocksWrapperProps: any;
  children?: any;
};

export default defineComponent({
  name: "builder-blocks-wrapper",

  props: [
    "blocks",
    "parent",
    "path",
    "styleProp",
    "BlocksWrapperProps",
    "BlocksWrapper",
  ],

  mounted() {},

  computed: {
    className() {
      return "builder-blocks" + (!this.blocks?.length ? " no-blocks" : "");
    },
  },

  methods: {
    onClick() {
      if (isEditing() && !this.blocks?.length) {
        window.parent?.postMessage(
          {
            type: "builder.clickEmptyBlocks",
            data: {
              parentElementId: this.parent,
              dataPath: this.path,
            },
          },
          "*"
        );
      }
    },
    onMouseEnter() {
      if (isEditing() && !this.blocks?.length) {
        window.parent?.postMessage(
          {
            type: "builder.hoverEmptyBlocks",
            data: {
              parentElementId: this.parent,
              dataPath: this.path,
            },
          },
          "*"
        );
      }
    },
  },
});
</script>

<style scoped>
.component-178o76acnws {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
</style>