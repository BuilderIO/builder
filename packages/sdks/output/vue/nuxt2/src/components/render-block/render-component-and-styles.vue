<template>
  <block-styles
    v-if="TARGET === 'vue' || TARGET === 'svelte'"
    :block="block"
  ></block-styles>

  <component v-bind="componentOptions" v-if="componentRef" :is="componentRef">
    <render-block
      v-for="(child, index) in blockChildren"
      :block="child"
      :key="child.id"
    ></render-block>
  </component>
</template>
<script>
import { TARGET } from "../../constants/target.js";
import BlockStyles from "./block-styles";
import RenderBlock from "./render-block";

export default {
  name: "render-component-and-styles",
  components: {
    "block-styles": async () => BlockStyles,
    "render-block": async () => RenderBlock,
  },
  props: ["block", "componentRef", "componentOptions", "blockChildren"],

  data: () => ({ TARGET }),
};
</script>
