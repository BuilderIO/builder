<script lang="ts">
  import { untrack } from 'svelte';
  import ContentVariants from '../../components/content-variants/content-variants.svelte';
  import { getClassPropName } from '../../functions/get-class-prop-name.js';
  import type { BuilderContent } from '../../types/builder-content.js';
  import type { Nullable } from '../../types/typescript.js';
  import { fetchSymbolContent, isSymbolContentInlinedInParent } from './symbol.helpers.js';
  import type { SymbolProps } from './symbol.types.js';

  let {
    symbol,
    dynamic,
    attributes,
    builderBlock,
    builderContext,
    builderComponents,
    builderLinkComponent,
  }: SymbolProps = $props();

  const className = $derived(
    [
      attributes?.[getClassPropName()],
      'builder-symbol',
      symbol?.inline ? 'builder-inline-symbol' : undefined,
      symbol?.dynamic || dynamic ? 'builder-dynamic-symbol' : undefined,
    ]
      .filter(Boolean)
      .join(' ')
  );

  const customComponents = $derived(Object.values(builderComponents));

  // Initial values only, as in the source: later content comes from `setContent`.
  // svelte-ignore state_referenced_locally
  let contentToUse = $state<Nullable<BuilderContent>>(symbol?.content);
  // svelte-ignore state_referenced_locally
  let symbolEntry = $state(symbol?.entry);

  function setContent() {
    if (contentToUse && symbolEntry === symbol?.entry) return;

    fetchSymbolContent({
      symbol,
      builderContextValue: builderContext,
    }).then((newContent) => {
      if (newContent) {
        contentToUse = newContent;
        symbolEntry = symbol?.entry;
      }
    });
  }

  // `onMount` + `onUpdate([props.symbol])` in the source: runs on mount and whenever `symbol`
  // changes (client only).
  $effect.pre(() => {
    void symbol;
    untrack(setContent);
  });
</script>

<div {...attributes} class={className}>
  <ContentVariants
    nonce={builderContext.nonce}
    isNestedRender
    isContentInlinedInParent={isSymbolContentInlinedInParent(symbol, builderBlock?.bindings)}
    apiVersion={builderContext.apiVersion}
    apiKey={symbol?.global && symbol?.ownerId ? symbol.ownerId : builderContext.apiKey!}
    context={{ ...builderContext.context, symbolId: builderBlock?.id }}
    {customComponents}
    data={{
      ...symbol?.data,
      ...builderContext.localState,
      ...contentToUse?.data?.state,
    }}
    canTrack={builderContext.canTrack}
    model={symbol?.model ?? ''}
    content={contentToUse}
    linkComponent={builderLinkComponent}
    blocksWrapper="div"
    contentWrapper="div"
  />
</div>
