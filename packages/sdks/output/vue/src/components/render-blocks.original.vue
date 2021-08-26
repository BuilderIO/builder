<template>
  <div
    class="div-1t7beu09hin"
    :builder-path="path"
    :builder-parent-id="parent"
    @click="onClick"
    @mouseenter="onMouseEnter"
    :class="
      _classStringToObject(
        'builder-blocks' + (!this.blocks?.length ? ' no-blocks' : '')
      )
    "
  >
    <template v-if="blocks">
      <template :key="index" v-for="(block, index) in blocks">
        <render-block :block="block"></render-block>
      </template>
    </template>
  </div>
</template>
<script>
import { isEditing } from "../functions/is-editing";
import RenderBlock from "./render-block.lite";

export default {
  name: "RenderBlocks",
  components: { RenderBlock },
  props: ["blocks", "parent", "path"],

  data: () => ({ RenderBlock }),

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
    _classStringToObject(str) {
      const obj = {};
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
};
</script>
<style scoped>
.div-1t7beu09hin {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
</style>
