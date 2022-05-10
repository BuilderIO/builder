<template>
  <render-inlined-styles :styles="css"></render-inlined-styles>
</template>
<script>
import RenderInlinedStyles from "../render-inlined-styles";

export default {
  name: "block-styles",
  components: { "render-inlined-styles": async () => RenderInlinedStyles },
  props: ["block"],

  computed: {
    css() {
      // TODO: media queries
      const styleObject = this.block.responsiveStyles?.large;

      if (!styleObject) {
        return "";
      }

      let str = `.${this.block.id} {`;

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
