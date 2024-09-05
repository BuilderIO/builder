<template>
  <div
    :style="{
      pointerEvents: 'auto',
    }"
    v-bind="
      !builderContext.context?.symbolId && {
        'builder-slot': name,
      }
    "
  >
    <Blocks
      :parent="builderContext.context?.symbolId"
      :path="`symbol.data.${name}`"
      :context="builderContext"
      :blocks="builderContext.rootState?.[name]"
    ></Blocks>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import Blocks from "../../components/blocks/blocks.vue";
import { deoptSignal } from "../../functions/deopt";
import type { BuilderBlock } from "../../types/builder-block";
import type { BuilderDataProps } from "../../types/builder-props";

export type DropzoneProps = BuilderDataProps & {
  name: string;
  attributes: any;
};

export default defineComponent({
  name: "builder-slot",
  components: { Blocks: Blocks },
  props: ["builderContext", "name"],
});
</script>