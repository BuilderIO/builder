<template>
  <div
    class="div-1w44c96rh1s"
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
  name: "render-blocks",
  components: { "render-block": async () => RenderBlock },
  props: ["blocks", "parent", "path"],

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
.div-1w44c96rh1s {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
</style>
