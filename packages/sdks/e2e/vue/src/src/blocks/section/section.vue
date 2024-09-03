<template>
  <section
    :style="{
      width: '100%',
      alignSelf: 'stretch',
      flexGrow: 1,
      boxSizing: 'border-box',
      maxWidth: maxWidth || 1200,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      marginLeft: 'auto',
      marginRight: 'auto',
    }"
    v-bind="filterAttrs(attributes, 'v-on:', false)"
    v-on="filterAttrs(attributes, 'v-on:', true)"
  >
    <slot />
  </section>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { filterAttrs } from "../helpers";
import type { SectionProps } from "./section.types";
import { setAttrs } from "../helpers";

export default defineComponent({
  name: "builder-section-component",

  props: ["attributes", "maxWidth"],

  data() {
    return { filterAttrs };
  },
});
</script>