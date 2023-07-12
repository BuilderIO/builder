<template>
  <template v-if="componentRef">
    <component :is="componentRef" v-bind="componentOptions">
      <template
        :key="'render-block-' + child.id"
        v-for="(child, index) in blockChildren"
      >
        <render-block :block="child" :context="context"></render-block>
      </template>
      <template
        :key="'block-style-' + child.id"
        v-for="(child, index) in blockChildren"
      >
        <block-styles :block="child" :context="context"></block-styles>
      </template>
    </component>
  </template>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from "vue";

import type { BuilderBlock } from "../../types/builder-block.js";
const BlockStyles = () =>
  import("./block-styles.vue")
    .then((x) => x.default)
    .catch((err) => {
      console.error(
        "Error while attempting to dynamically import component BlockStyles at ./block-styles.vue",
        err
      );
      throw err;
    });
const RenderBlock = () =>
  import("./render-block.vue")
    .then((x) => x.default)
    .catch((err) => {
      console.error(
        "Error while attempting to dynamically import component RenderBlock at ./render-block.vue",
        err
      );
      throw err;
    });
import type { BuilderContextInterface } from "../../context/types.js";

type ComponentOptions = {
  [index: string]: any;
  attributes?: {
    [index: string]: any;
  };
};
export interface RenderComponentProps {
  componentRef: any;
  componentOptions: ComponentOptions;
  blockChildren: BuilderBlock[];
  context: BuilderContextInterface;
}

export default defineComponent({
  name: "render-component",
  components: {
    RenderBlock: defineAsyncComponent(RenderBlock),
    BlockStyles: defineAsyncComponent(BlockStyles),
  },
  props: ["componentRef", "componentOptions", "blockChildren", "context"],
});
</script>