<template>
  <DynamicRenderer
    :TagName="Wrapper"
    :attributes="
      getBlockProperties({
        block: block,
        context: context,
      })
    "
    :actionAttributes="
      getBlockActions({
        block: block,
        rootState: context.rootState,
        rootSetState: context.rootSetState,
        localState: context.localState,
        context: context.context,
        stripPrefix: true,
      })
    "
    ><slot
  /></DynamicRenderer>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from "vue";

import type { BuilderContextInterface } from "../../../context/types";
import { getBlockActions } from "../../../functions/get-block-actions";
import { getBlockProperties } from "../../../functions/get-block-properties";
import type { BuilderBlock } from "../../../types/builder-block";
const DynamicRenderer = () =>
  import("../../dynamic-renderer/dynamic-renderer.vue")
    .then((x) => x.default)
    .catch((err) => {
      console.error(
        "Error while attempting to dynamically import component DynamicRenderer at ../../dynamic-renderer/dynamic-renderer.vue",
        err
      );
      throw err;
    });

type BlockWrapperProps = {
  Wrapper: string;
  block: BuilderBlock;
  context: BuilderContextInterface;
  children?: any;
};

/**
 * This component renders a block's wrapper HTML element (from the block's `tagName` property).
 */

export default defineComponent({
  name: "block-wrapper",
  components: { DynamicRenderer: defineAsyncComponent(DynamicRenderer) },
  props: ["Wrapper", "block", "context"],

  data() {
    return { getBlockActions, getBlockProperties };
  },
});
</script>