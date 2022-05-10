<template>
  <component v-else="" :is="tagName">{{ styles }}</component>
</template>
<script>
import { TARGET } from "../constants/target.js";

export default {
  name: "render-inlined-styles",

  props: ["styles"],

  data: () => ({ TARGET }),

  computed: {
    injectedStyleScript() {
      return `<${this.tagName}>${this.styles}</${this.tagName}>`;
    },
    tagName() {
      // NOTE: we have to obfusctate the name of the tag due to a limitation in the svelte-preprocessor plugin.
      // https://github.com/sveltejs/vite-plugin-svelte/issues/315#issuecomment-1109000027
      return "sty" + "le";
    },
  },
};
</script>
