<template>
  <template v-if="componentRef">
    <component
      :is="Wrapper"
      v-bind="
        getWrapperProps({
          componentOptions: componentOptions,
          builderBlock: builderBlock,
          context: context,
          componentRef: componentRef,
          linkComponent: linkComponent,
          includeBlockProps: includeBlockProps,
          isInteractive: isInteractive,
          contextValue: context,
        })
      "
      ><template :key="child.id" v-for="(child, index) in blockChildren">
        <Block
          :block="child"
          :context="context"
          :registeredComponents="registeredComponents"
          :linkComponent="linkComponent"
        ></Block> </template
    ></component>
  </template>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { wrapComponentRef } from "../../../content/wrap-component-ref";
import Block from "../../block.vue";
import InteractiveElement from "../interactive-element.vue";
import type { ComponentProps } from "./component-ref.helpers";
import { getWrapperProps } from "./component-ref.helpers";

export default defineComponent({
  name: "component-ref",
  components: { Block: Block, InteractiveElement: InteractiveElement },
  props: [
    "isInteractive",
    "componentRef",
    "componentOptions",
    "builderBlock",
    "context",
    "linkComponent",
    "includeBlockProps",
    "blockChildren",
    "registeredComponents",
  ],

  data() {
    return {
      Wrapper: this.isInteractive
        ? wrapComponentRef(InteractiveElement)
        : this.componentRef,
      getWrapperProps,
    };
  },
});
</script>