<template>
  <render-inlined-styles :styles="injectedStyles"></render-inlined-styles>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import RenderInlinedStyles from "../../render-inlined-styles.vue";
import type { CustomFont } from "./render-styles.helpers";
import { getCss } from "./render-styles.helpers";
import { getFontCss } from "./render-styles.helpers";

interface Props {
  cssCode?: string;
  customFonts?: CustomFont[];
  contentId?: string;
}

export default defineComponent({
  name: "render-content-styles",
  components: { RenderInlinedStyles: RenderInlinedStyles },
  props: ["cssCode", "contentId", "customFonts"],

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

.builder-text > p:first-of-type, .builder-text > .builder-paragraph:first-of-type {
  margin: 0;
}
.builder-text > p, .builder-text > .builder-paragraph {
  color: inherit;
  line-height: inherit;
  letter-spacing: inherit;
  font-weight: inherit;
  font-size: inherit;
  text-align: inherit;
  font-family: inherit;
}
`.trim(),
    };
  },
});
</script>