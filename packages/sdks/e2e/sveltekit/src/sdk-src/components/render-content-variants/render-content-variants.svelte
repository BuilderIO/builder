<script context="module" lang="ts">
  type VariantsProviderProps = RenderContentProps;
</script>

<script lang="ts">
  import {
    checkShouldRunVariants,
    getVariants,
    getVariantsScriptString,
  } from "./helpers";
  import RenderContent from "../render-content/render-content.svelte";
  import type { RenderContentProps } from "../render-content/render-content.types";
  import { getDefaultCanTrack } from "../../helpers/canTrack";
  import RenderInlinedStyles from "../render-inlined-styles.svelte";
  import { handleABTestingSync } from "../../helpers/ab-tests";

  export let content: VariantsProviderProps["content"];
  export let canTrack: VariantsProviderProps["canTrack"];
  export let apiKey: VariantsProviderProps["apiKey"];
  export let apiVersion: VariantsProviderProps["apiVersion"];
  export let customComponents: VariantsProviderProps["customComponents"];
  export let model: VariantsProviderProps["model"];

  let variantScriptStr = getVariantsScriptString(
    getVariants(content).map((value) => ({
      id: value.id!,
      testRatio: value.testRatio,
    })),
    content?.id || ""
  );
  let shouldRenderVariants = checkShouldRunVariants({
    canTrack: getDefaultCanTrack(canTrack),
    content: content,
  });
  let hideVariantsStyleString = getVariants(content)
    .map((value) => `.variant-${value.id} { display: none; } `)
    .join("");
  let contentToRender = checkShouldRunVariants({
    canTrack: getDefaultCanTrack(canTrack),
    content: content,
  })
    ? content
    : handleABTestingSync({
        item: content,
        canTrack: getDefaultCanTrack(canTrack),
      });
</script>

{#if shouldRenderVariants}
  <RenderInlinedStyles
    id={`variants-styles-${content?.id}`}
    styles={hideVariantsStyleString}
  />

  <svelte:element this={"script"} id={`variants-script-${content?.id}`}
    >{@html variantScriptStr}</svelte:element
  >

  {#each getVariants(content) as variant (variant.id)}
    <RenderContent
      content={variant}
      {apiKey}
      {apiVersion}
      {canTrack}
      {customComponents}
      hideContent={true}
      parentContentId={content?.id}
      isSsrAbTest={shouldRenderVariants}
    />
  {/each}
{/if}

<RenderContent
  {model}
  content={contentToRender}
  {apiKey}
  {apiVersion}
  {canTrack}
  {customComponents}
  classNameProp={`variant-${content?.id}`}
  parentContentId={content?.id}
  isSsrAbTest={shouldRenderVariants}
/>