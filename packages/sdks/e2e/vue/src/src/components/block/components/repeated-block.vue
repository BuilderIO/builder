<template>
  <Block
    :block="block"
    :context="store"
    :registeredComponents="registeredComponents"
    :linkComponent="linkComponent"
  ></Block>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from "vue";

import BuilderContext from "../../../context/builder.context";
import type { BuilderContextInterface } from "../../../context/types";
import type { BlockProps } from "../block.vue";
const Block = () =>
  import("../block.vue")
    .then((x) => x.default)
    .catch((err) => {
      console.error(
        "Error while attempting to dynamically import component Block at ../block.vue",
        err
      );
      throw err;
    });

type Props = Omit<BlockProps, "context"> & {
  repeatContext: BuilderContextInterface;
};

export default defineComponent({
  name: "repeated-block",
  components: { Block: defineAsyncComponent(Block) },
  props: ["repeatContext", "block", "registeredComponents", "linkComponent"],

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