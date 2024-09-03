<template>
  <button
    type="submit"
    v-bind="filterAttrs(attributes, 'v-on:', false)"
    v-on="filterAttrs(attributes, 'v-on:', true)"
  >
    {{ text }}
  </button>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { filterAttrs } from "../../helpers";
import { setAttrs } from "../../helpers";

/**
 * This import is used by the Svelte SDK. Do not remove.
 */

export interface ButtonProps {
  attributes?: any;
  text?: string;
}

export default defineComponent({
  name: "builder-submit-button",

  props: ["attributes", "text"],

  data() {
    return { filterAttrs };
  },
});
</script>