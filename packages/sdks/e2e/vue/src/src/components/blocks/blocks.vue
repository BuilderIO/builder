<template>
  <BlocksWrapper
    :blocks="blocks"
    :parent="parent"
    :path="path"
    :styleProp="styleProp"
    :BlocksWrapper="context?.BlocksWrapper || builderContext.BlocksWrapper"
    :BlocksWrapperProps="
      context?.BlocksWrapperProps || builderContext.BlocksWrapperProps
    "
  >
    <template v-if="blocks">
      <template :key="block.id" v-for="(block, index) in blocks">
        <Block
          :block="block"
          :linkComponent="linkComponent"
          :context="context || builderContext"
          :registeredComponents="
            registeredComponents || componentsContext.registeredComponents
          "
        ></Block>
      </template>
    </template>
  </BlocksWrapper>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import BuilderContext from "../../context/builder.context";
import ComponentsContext from "../../context/components.context";
import Block from "../block/block.vue";
import BlocksWrapper from "./blocks-wrapper.vue";
import type { BlocksProps } from "./blocks.types";

export default defineComponent({
  name: "builder-blocks",
  components: { BlocksWrapper: BlocksWrapper, Block: Block },
  props: [
    "blocks",
    "parent",
    "path",
    "styleProp",
    "context",
    "linkComponent",
    "registeredComponents",
  ],

  inject: {
    builderContext: BuilderContext.key,

    componentsContext: ComponentsContext.key,
  },
});
</script>