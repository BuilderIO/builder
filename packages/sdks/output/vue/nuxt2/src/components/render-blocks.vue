<template>
  <div
    class="div-98h3rxgxso"
    :builder-path="path"
    :builder-parent-id="parent"
    @click="onClick"
    @mouseenter="onMouseEnter"
    :class="
      _classStringToObject(
        'builder-blocks' +
          (!(this.blocks && this.blocks.length) ? ' no-blocks' : '')
      )
    "
  >
    <render-block
      v-for="(block, index) in blocks"
      :block="block"
      :key="index"
    ></render-block>
  </div>
</template>
<script>
import { isEditing } from '../functions/is-editing';
import RenderBlock from './render-block';

export default {
  name: 'render-blocks',
  components: { 'render-block': async () => RenderBlock },
  props: ['blocks', 'parent', 'path'],

  methods: {
    onClick() {
      if (isEditing() && !this.blocks?.length) {
        window.parent?.postMessage(
          {
            type: 'builder.clickEmptyBlocks',
            data: {
              parentElementId: this.parent,
              dataPath: this.path,
            },
          },
          '*'
        );
      }
    },
    onMouseEnter() {
      if (isEditing() && !this.blocks?.length) {
        window.parent?.postMessage(
          {
            type: 'builder.hoverEmptyBlocks',
            data: {
              parentElementId: this.parent,
              dataPath: this.path,
            },
          },
          '*'
        );
      }
    },
    _classStringToObject(str) {
      const obj = {};
      if (typeof str !== 'string') {
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
.div-98h3rxgxso {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
</style>
