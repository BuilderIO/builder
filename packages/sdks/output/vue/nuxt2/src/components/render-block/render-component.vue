<template>
  <component v-bind="componentOptions" v-if="componentRef" :is="componentRef">
    <render-block
      v-for="(child, index) in blockChildren"
      :block="child"
      :key="'render-block-' + child.id"
    ></render-block>
    <block-styles
      v-for="(child, index) in blockChildren"
      :block="child"
      :key="'block-style-' + child.id"
    ></block-styles>
  </component>
</template>
<script>
import BlockStyles from "./block-styles";
import RenderBlock from "./render-block";

export default {
  name: "render-component",
  components: {
    "render-block": async () => RenderBlock,
    "block-styles": async () => BlockStyles,
  },
  props: ["componentRef", "componentOptions", "blockChildren"],
};
</script>
