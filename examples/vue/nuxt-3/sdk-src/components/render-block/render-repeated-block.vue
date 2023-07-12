<template>
  <render-block :block="block" :context="store"></render-block>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from "vue";

import BuilderContext from "../../context/builder.context.js";
import type { BuilderContextInterface } from "../../context/types.js";
import type { BuilderBlock } from "../../types/builder-block";
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

type Props = {
  block: BuilderBlock;
  repeatContext: BuilderContextInterface;
};

export default defineComponent({
  name: "render-repeated-block",
  components: { RenderBlock: defineAsyncComponent(RenderBlock) },
  props: ["repeatContext", "block"],

  data() {
    return { store: this.repeatContext };
  },

  provide() {
    const _this = this;
    return {
      [BuilderContext.key]: _this.store,
    };
  },
});
</script>