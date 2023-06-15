<script context="module" lang="ts">
  interface Props {
    cssCode?: string;
    customFonts?: CustomFont[];
    contentId?: string;
  }
</script>

<script lang="ts">
  import RenderInlinedStyles from "../../render-inlined-styles.svelte";
  import type { CustomFont } from "./render-styles.helpers";
  import { getCss } from "./render-styles.helpers";
  import { getFontCss } from "./render-styles.helpers";

  export let cssCode: Props["cssCode"];
  export let contentId: Props["contentId"];
  export let customFonts: Props["customFonts"];

  let injectedStyles = `
${getCss({
  cssCode: cssCode,
  contentId: contentId,
})}
${getFontCss({
  customFonts: customFonts,
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
`.trim();
</script>

<RenderInlinedStyles styles={injectedStyles} />