<script context="module" lang="ts">
  export interface SymbolInfo {
    model?: string;
    entry?: string;
    data?: any;
    content?: BuilderContent;
    inline?: boolean;
    dynamic?: boolean;
  }

  export interface SymbolProps {
    symbol?: SymbolInfo;
    dataOnly?: boolean;
    dynamic?: boolean;
    builderBlock?: BuilderBlock;
    attributes?: any;
    inheritState?: boolean;
  }
</script>

<script lang="ts">
  import { getContext, onMount } from 'svelte';

  import RenderContent from '../../components/render-content/render-content.svelte';
  import BuilderContext, {
    type BuilderStore,
  } from '../../context/builder.context.js';
  import { getContent } from '../../functions/get-content/index.js';
  import type { BuilderContent } from '../../types/builder-content.js';
  import type { BuilderBlock } from '../../types/builder-block.js';
  import { TARGET } from '../../constants/target';
  import { logger } from '../../helpers/logger';

  const isEvent = (attr) => attr.startsWith('on:');
  const isNonEvent = (attr) => !attr.startsWith('on:');
  const filterAttrs = (attrs = {}, filter) => {
    const validAttr = {};
    Object.keys(attrs).forEach((attr) => {
      if (filter(attr)) {
        validAttr[attr] = attrs[attr];
      }
    });
    return validAttr;
  };
  const setAttrs = (node, attrs = {}) => {
    const attrKeys = Object.keys(attrs);
    const setup = (attr) => node.addEventListener(attr.substr(3), attrs[attr]);
    const teardown = (attr) =>
      node.removeEventListener(attr.substr(3), attrs[attr]);
    attrKeys.map(setup);
    return {
      update(attrs = {}) {
        const attrKeys = Object.keys(attrs);
        attrKeys.map(teardown);
        attrKeys.map(setup);
      },
      destroy() {
        attrKeys.map(teardown);
      },
    };
  };

  export let attributes: SymbolProps['attributes'];
  export let symbol: SymbolProps['symbol'];
  export let dynamic: SymbolProps['dynamic'];

  let builderContext = getContext<BuilderStore>(BuilderContext.key);

  function fetchContent() {
    /**
     * If:
     * - we have a symbol prop
     * - yet it does not have any content
     * - and we have not already stored content from before
     * - and it has a model name
     *
     * then we want to re-fetch the symbol content.
     */
    if (
      !contentToUse &&
      symbol?.model &&
      // This is a hack, we should not need to check for this, but it is needed for Svelte.
      $builderContext?.apiKey
    ) {
      getContent({
        model: symbol.model,
        apiKey: $builderContext.apiKey,
        apiVersion: $builderContext.apiVersion,
        query: {
          id: symbol.entry,
        },
      })
        .then((response) => {
          if (response) {
            contentToUse = response;
          }
        })
        .catch((err) => {
          logger.error('Could not fetch symbol content: ', err);
        });
    }
  }

  let className = [
    ...(TARGET === 'vue2' || TARGET === 'vue3'
      ? Object.keys(attributes.class)
      : [attributes.class]),
    'builder-symbol',
    symbol?.inline ? 'builder-inline-symbol' : undefined,
    symbol?.dynamic || dynamic ? 'builder-dynamic-symbol' : undefined,
  ]
    .filter(Boolean)
    .join(' ');
  let contentToUse = symbol?.content;

  onMount(() => {
    fetchContent();
  });

  function onUpdateFn_0() {
    fetchContent();
  }
  $: onUpdateFn_0(...[symbol]);
</script>

<div
  {...filterAttrs(attributes, isNonEvent)}
  data-dataSet={{
    class: className,
  }}
  class={className}
  use:setAttrs={filterAttrs(attributes, isEvent)}
>
  <RenderContent
    apiVersion={$builderContext.apiVersion}
    apiKey={$builderContext.apiKey}
    context={$builderContext.context}
    customComponents={Object.values($builderContext.registeredComponents)}
    data={{
      ...symbol?.data,
      ...$builderContext.localState,
      ...contentToUse?.data?.state,
    }}
    model={symbol?.model}
    content={contentToUse}
  />
</div>
