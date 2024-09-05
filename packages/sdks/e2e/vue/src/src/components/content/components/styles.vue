<template>
  <InlinedStyles
    id="builderio-content"
    :styles="injectedStyles"
    :nonce="nonce"
  ></InlinedStyles>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import type { BuilderNonceProp } from "../../../types/builder-props";
import InlinedStyles from "../../inlined-styles.vue";
import type { CustomFont } from "./styles.helpers";
import { getCss, getDefaultStyles, getFontCss } from "./styles.helpers";

interface Props extends BuilderNonceProp {
  cssCode?: string;
  customFonts?: CustomFont[];
  contentId?: string;
  isNestedRender?: boolean;
}

export default defineComponent({
  name: "content-styles",
  components: { InlinedStyles: InlinedStyles },
  props: ["cssCode", "contentId", "customFonts", "isNestedRender", "nonce"],

  data() {
    return {
      injectedStyles: `
${getCss({
  cssCode: this.cssCode,
  contentId: this.contentId,
})}
${getFontCss({
  customFonts: this.customFonts,
})}
${getDefaultStyles(this.isNestedRender)}
`.trim(),
    };
  },
});
</script>