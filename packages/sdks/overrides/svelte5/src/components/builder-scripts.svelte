<!--
  Emits the Variant Container and A/B test helper scripts once for every `<Content>` inside it,
  instead of once per `<Content>`.
-->
<script lang="ts">
  import { getContext, setContext, type Snippet } from 'svelte';
  import { getInitPersonalizationVariantsFnsScriptString } from '../blocks/personalization-container/helpers.js';
  import BuilderScriptsContext from '../context/builder-scripts.context.js';
  import { scriptTag } from '../helpers/inline-tags.js';
  import { getInitVariantsFnsScriptString } from './content-variants/helpers.js';

  let { nonce = '', children }: { nonce?: string; children?: Snippet } = $props();

  const parent = getContext<{ scriptsEmitted: boolean } | undefined>(BuilderScriptsContext.key);
  setContext(BuilderScriptsContext.key, { scriptsEmitted: true });

  // svelte-ignore state_referenced_locally
  const html = parent?.scriptsEmitted
    ? ''
    : scriptTag(
        'builderio-init-personalization-variants-fns',
        getInitPersonalizationVariantsFnsScriptString(),
        nonce
      ) + scriptTag('builderio-init-variants-fns', getInitVariantsFnsScriptString(), nonce);
</script>

{@html html}
{@render children?.()}
