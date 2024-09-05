<template>
  <div
    class="builder-text"
    v-html="processedText"
    :style="{
      outline: 'none',
    }"
  ></div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { evaluate } from "../../functions/evaluate/index";
import type { TextProps } from "./text.types";

export default defineComponent({
  name: "builder-text",

  props: ["builderContext", "text"],

  computed: {
    processedText() {
      const context = this.builderContext;
      const {
        context: contextContext,
        localState,
        rootState,
        rootSetState,
      } = context;
      return String(this.text?.toString() || "").replace(
        /{{([^}]+)}}/g,
        (match, group) =>
          evaluate({
            code: group,
            context: contextContext,
            localState,
            rootState,
            rootSetState,
            enableCache: false,
          }) as string
      );
    },
  },
});
</script>