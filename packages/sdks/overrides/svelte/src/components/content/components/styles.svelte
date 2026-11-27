<script context="module" lang="ts">
  interface Props extends BuilderNonceProp {
    cssCode?: string;
    customFonts?: CustomFont[];
    contentId?: string;
    isNestedRender?: boolean;
    content?: BuilderContent | null;
    locale?: unknown;
  }
</script>

<!--
  Svelte override of `src/components/content/components/styles.lite.tsx` (keep in sync).

  It also renders the content's static block styles in one stylesheet (see `getContentBlockStyles`);
  the Svelte Block skips its own `<style>` tag for those blocks.
-->
<script lang="ts">
  import type { BuilderContent } from '../../../types/builder-content';
  import type { BuilderNonceProp } from '../../../types/builder-props';
  import { getContentBlockStyles } from '../../block/components/block-styles.helpers';
  import InlinedStyles from '../../inlined-styles.svelte';
  import type { CustomFont } from './styles.helpers';
  import { getCss, getDefaultStyles, getFontCss } from './styles.helpers';

  export let cssCode: Props['cssCode'] = undefined;
  export let contentId: Props['contentId'] = undefined;
  export let customFonts: Props['customFonts'] = undefined;
  export let isNestedRender: Props['isNestedRender'] = undefined;
  export let nonce: Props['nonce'];
  export let content: Props['content'] = undefined;
  export let locale: Props['locale'] = undefined;

  let injectedStyles = `
${getCss({
  cssCode: cssCode,
  contentId: contentId,
})}
${getFontCss({
  customFonts: customFonts,
})}
${getDefaultStyles(isNestedRender)}
`.trim();

  $: blockStyles = getContentBlockStyles(content, locale as string | undefined).css;
</script>

<InlinedStyles id="builderio-content" styles={injectedStyles} {nonce} />
{#if blockStyles}<InlinedStyles id="builderio-block" styles={blockStyles} {nonce} />{/if}
