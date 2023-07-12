<template>
  <div
    :class="_classStringToObject(className + ' div-20vehov4ay6')"
    :builder-path="path"
    :builder-parent-id="parent"
    :dataSet="{
      class: className,
    }"
    :style="styleProp"
    @click="onClick()"
    @mouseenter="onMouseEnter()"
    @keypress="onClick()"
  >
    <template v-if="blocks">
      <template
        :key="'render-block-' + block.id"
        v-for="(block, index) in blocks"
      >
        <render-block :block="block" :context="builderContext"></render-block>
      </template>
    </template>

    <template v-if="blocks">
      <template
        :key="'block-style-' + block.id"
        v-for="(block, index) in blocks"
      >
        <block-styles :block="block" :context="builderContext"></block-styles>
      </template>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import BuilderContext from "../context/builder.context.js";
import { isEditing } from "../functions/is-editing.js";
import type { BuilderBlock } from "../types/builder-block.js";
import BlockStyles from "./render-block/block-styles.vue";
import RenderBlock from "./render-block/render-block.vue";

export type RenderBlockProps = {
  blocks?: BuilderBlock[];
  parent?: string;
  path?: string;
  styleProp?: Record<string, any>;
};

export default defineComponent({
  name: "render-blocks",
  components: { RenderBlock: RenderBlock, BlockStyles: BlockStyles },
  props: ["blocks", "parent", "path", "styleProp"],

  inject: {
    builderContext: BuilderContext.key,
  },

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
.div-20vehov4ay6 {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
</style>