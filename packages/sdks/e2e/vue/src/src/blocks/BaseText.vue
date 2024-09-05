<template>
  <span :style="builderContext.inheritedStyles">{{ text }}</span>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import BuilderContext from "../context/builder.context";

export interface BaseTextProps {
  text: string;
}

export default defineComponent({
  name: "builder-base-text",

  props: ["text"],

  inject: {
    builderContext: BuilderContext.key,
  },
});
</script>