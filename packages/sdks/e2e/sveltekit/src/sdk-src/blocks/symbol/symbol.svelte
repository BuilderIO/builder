<script context="module" lang="ts">
  /**
   * This import is used by the Svelte SDK. Do not remove.
   */ // eslint-disable-next-line unused-imports/no-unused-imports, @typescript-eslint/no-unused-vars
  export interface SymbolInfo {
    model?: string;
    entry?: string;
    data?: any;
    content?: BuilderContent;
    inline?: boolean;
    dynamic?: boolean;
  }

  /**
   * This import is used by the Svelte SDK. Do not remove.
   */ // eslint-disable-next-line unused-imports/no-unused-imports, @typescript-eslint/no-unused-vars
  export interface SymbolProps extends BuilderComponentsProp {
    symbol?: SymbolInfo;
    dataOnly?: boolean;
    dynamic?: boolean;
    attributes?: any;
    inheritState?: boolean;
  }
</script>

<script lang="ts">
  import { onMount } from "svelte";

  import ContentVariants from "../../components/content-variants/content-variants.svelte";
  import type { BuilderContent } from "../../types/builder-content.js";
  import type {
    BuilderComponentsProp,
    PropsWithBuilderData,
  } from "../../types/builder-props.js";
  import { filterAttrs } from "../helpers.js";
  import { setAttrs } from "../helpers.js";
  import { fetchSymbolContent } from "./symbol.helpers.js";
  import type { Nullable } from "../../types/typescript.js";

  export let js: PropsWithBuilderData<SymbolProps>["js"];
  export let attributes: PropsWithBuilderData<SymbolProps>["attributes"];
  export let symbol: PropsWithBuilderData<SymbolProps>["symbol"];
  export let dynamic: PropsWithBuilderData<SymbolProps>["dynamic"];
  export let builderContext: PropsWithBuilderData<SymbolProps>["builderContext"];
  export let builderComponents: PropsWithBuilderData<SymbolProps>["builderComponents"];

  function setContent() {
    if (contentToUse) return;
    fetchSymbolContent({
      symbol: symbol,
      builderContextValue: $builderContext,
    }).then((newContent) => {
      if (newContent) {
        contentToUse = newContent;
      }
    });
  }
  $: className = () => {
    return [
      ...[attributes.class],
      "builder-symbol",
      symbol?.inline ? "builder-inline-symbol" : undefined,
      symbol?.dynamic || dynamic ? "builder-dynamic-symbol" : undefined,
    ]
      .filter(Boolean)
      .join(" ");
  };

  let contentToUse = symbol?.content;

  onMount(() => {
    setContent();
  });

  function onUpdateFn_0(..._args: any[]) {
    setContent();
  }
  $: onUpdateFn_0(...[symbol]);
</script>

<div
  {...filterAttrs(attributes, "on:", false)}
  {...{}}
  class={className()}
  use:setAttrs={filterAttrs(attributes, "on:", true)}
>
  <ContentVariants
    __isNestedRender={true}
    apiVersion={$builderContext.apiVersion}
    apiKey={$builderContext.apiKey}
    context={$builderContext.context}
    customComponents={Object.values(builderComponents)}
    data={{
      ...symbol?.data,
      ...$builderContext.localState,
      ...contentToUse?.data?.state,
    }}
    model={symbol?.model}
    content={contentToUse}
  />
</div>