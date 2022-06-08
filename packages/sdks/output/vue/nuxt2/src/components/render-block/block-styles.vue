<template>
  <render-inlined-styles
    v-if="TARGET === 'vue' || TARGET === 'svelte'"
    :styles="css"
  ></render-inlined-styles>
</template>
<script>
import { TARGET } from "../../constants/target.js";
import BuilderContext from "../../context/builder.context";
import { getProcessedBlock } from "../../functions/get-processed-block.js";
import RenderInlinedStyles from "../render-inlined-styles";

export default {
  name: "block-styles",
  components: { "render-inlined-styles": async () => RenderInlinedStyles },
  props: ["block"],

  data: () => ({ TARGET }),

  inject: {
    builderContext: "BuilderContext",
  },

  computed: {
    useBlock() {
      return getProcessedBlock({
        block: this.block,
        state: this.builderContext.state,
        context: this.builderContext.context,
      });
    },
    css() {
      // TODO: media queries
      const styleObject = this.useBlock.responsiveStyles?.large;

      if (!styleObject) {
        return "";
      }

      let str = `.${this.useBlock.id} {`;

      for (const key in styleObject) {
        const value = styleObject[key];

        if (typeof value === "string") {
          str += `${this.camelToKebabCase(key)}: ${value};`;
        }
      }

      str += "}";
      return str;
    },
  },

  methods: {
    camelToKebabCase(string) {
      return string
        .replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2")
        .toLowerCase();
    },
  },
};
</script>
