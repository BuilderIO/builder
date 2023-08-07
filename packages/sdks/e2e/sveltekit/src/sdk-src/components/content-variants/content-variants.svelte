<script context="module" lang="ts">
  type VariantsProviderProps = ContentVariantsProps & {
    /**
     * For internal use only. Do not provide this prop.
     */
    __isNestedRender?: boolean;
  };
</script>

<script lang="ts">
  import { onMount } from "svelte";

  import {
    checkShouldRunVariants,
    getScriptString,
    getVariants,
    getVariantsScriptString,
  } from "./helpers.js";
  import ContentComponent from "../content/content.svelte";
  import { getDefaultCanTrack } from "../../helpers/canTrack.js";
  import InlinedStyles from "../inlined-styles.svelte";
  import { handleABTestingSync } from "../../helpers/ab-tests.js";
  import InlinedScript from "../inlined-script.svelte";
  import { TARGET } from "../../constants/target.js";
  import type { ContentVariantsProps } from "./content-variants.types.js";

  export let canTrack: VariantsProviderProps["canTrack"];
  export let content: VariantsProviderProps["content"];
  export let __isNestedRender: VariantsProviderProps["__isNestedRender"];
  export let model: VariantsProviderProps["model"];
  export let data: VariantsProviderProps["data"];
  export let context: VariantsProviderProps["context"];
  export let apiKey: VariantsProviderProps["apiKey"];
  export let apiVersion: VariantsProviderProps["apiVersion"];
  export let customComponents: VariantsProviderProps["customComponents"];
  export let locale: VariantsProviderProps["locale"];
  export let includeRefs: VariantsProviderProps["includeRefs"];
  export let enrich: VariantsProviderProps["enrich"];

  $: variantScriptStr = () => {
    return getVariantsScriptString(
      getVariants(content).map((value) => ({
        id: value.testVariationId!,
        testRatio: value.testRatio,
      })),
      content?.id || ""
    );
  };
  $: hideVariantsStyleString = () => {
    return getVariants(content)
      .map((value) => `.variant-${value.testVariationId} { display: none; } `)
      .join("");
  };
  $: defaultContent = () => {
    return shouldRenderVariants
      ? {
          ...content,
          testVariationId: content?.id,
        }
      : handleABTestingSync({
          item: content,
          canTrack: getDefaultCanTrack(canTrack),
        });
  };

  let shouldRenderVariants = checkShouldRunVariants({
    canTrack: getDefaultCanTrack(canTrack),
    content: content,
  });

  onMount(() => {
    /**
     * We unmount the non-winning variants post-hydration in Vue.
     */
  });
</script>

{#if !__isNestedRender && TARGET !== "reactNative"}
  <InlinedScript scriptStr={getScriptString()} />
{/if}

{#if shouldRenderVariants}
  <InlinedStyles
    id={`variants-styles-${content?.id}`}
    styles={hideVariantsStyleString()}
  />

  <InlinedScript scriptStr={variantScriptStr()} />

  {#each getVariants(content) as variant (variant.testVariationId)}
    <ContentComponent
      content={variant}
      showContent={false}
      classNameProp={undefined}
      {model}
      {data}
      {context}
      {apiKey}
      {apiVersion}
      {customComponents}
      {canTrack}
      {locale}
      {includeRefs}
      {enrich}
      isSsrAbTest={shouldRenderVariants}
    />
  {/each}
{/if}

<ContentComponent
  {...{}}
  content={defaultContent()}
  classNameProp={`variant-${content?.id}`}
  showContent={true}
  {model}
  {data}
  {context}
  {apiKey}
  {apiVersion}
  {customComponents}
  {canTrack}
  {locale}
  {includeRefs}
  {enrich}
  isSsrAbTest={shouldRenderVariants}
/>