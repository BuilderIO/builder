<template>
  <component :attributes="attributes" :is="Wrapper" v-bind="wrapperProps"
    ><slot
  /></component>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from "vue";

import type { BuilderContextInterface } from "../../../context/types";
import { getBlockActions } from "../../../functions/get-block-actions";
import { getBlockProperties } from "../../../functions/get-block-properties";
import type { BuilderBlock } from "../../../types/builder-block";
import type { Dictionary } from "../../../types/typescript";

export type InteractiveElementProps = {
  Wrapper: any;
  block: BuilderBlock;
  context: BuilderContextInterface;
  wrapperProps: Dictionary<any>;
  includeBlockProps: boolean;
  children?: any;
};

export default defineComponent({
  name: "interactive-element",

  props: ["includeBlockProps", "block", "context", "wrapperProps", "Wrapper"],

  computed: {
    attributes() {
      return this.includeBlockProps
        ? {
            ...getBlockProperties({
              block: this.block,
              context: this.context,
            }),
            ...getBlockActions({
              block: this.block,
              rootState: this.context.rootState,
              rootSetState: this.context.rootSetState,
              localState: this.context.localState,
              context: this.context.context,
            }),
          }
        : {};
    },
  },
});
</script>