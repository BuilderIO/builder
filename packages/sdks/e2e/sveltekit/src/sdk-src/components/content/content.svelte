<script lang="ts">
  import { setContext } from "svelte";
  import { writable } from "svelte/store";

  import { getDefaultRegisteredComponents } from "../../constants/builder-registered-components.js";
  import type {
    BuilderContextInterface,
    BuilderRenderState,
    RegisteredComponents,
  } from "../../context/types.js";
  import {
    components,
    serializeComponentInfo,
  } from "../../functions/register-component.js";
  import Blocks from "../blocks/blocks.svelte";
  import ContentStyles from "./components/styles.svelte";
  import type { ContentProps } from "./content.types.js";
  import {
    getContentInitialValue,
    getContextStateInitialValue,
  } from "./content.helpers.js";
  import { TARGET } from "../../constants/target.js";
  import { getRenderContentScriptString } from "../content-variants/helpers.js";
  import EnableEditor from "./components/enable-editor.svelte";
  import InlinedScript from "../inlined-script.svelte";
  import { wrapComponentRef } from "./wrap-component-ref.js";
  import type { ComponentInfo } from "../../types/components.js";
  import type { Dictionary } from "../../types/typescript.js";
  import ComponentsContext from "../../context/components.context";

  export let content: ContentProps["content"];
  export let customComponents: ContentProps["customComponents"];
  export let data: ContentProps["data"];
  export let locale: ContentProps["locale"];
  export let context: ContentProps["context"];
  export let apiKey: ContentProps["apiKey"];
  export let apiVersion: ContentProps["apiVersion"];
  export let model: ContentProps["model"];
  export let canTrack: ContentProps["canTrack"];
  export let includeRefs: ContentProps["includeRefs"];
  export let enrich: ContentProps["enrich"];
  export let classNameProp: ContentProps["classNameProp"];
  export let showContent: ContentProps["showContent"];
  export let isSsrAbTest: ContentProps["isSsrAbTest"];

  function contentSetState(newRootState: BuilderRenderState) {
    $builderContextSignal.rootState = newRootState;
  }

  let scriptStr = getRenderContentScriptString({
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
    variationId: content?.testVariationId!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
    contentId: content?.id!,
  });
  let registeredComponents = [
    ...getDefaultRegisteredComponents(),
    // While this `components` object is deprecated, we must maintain support for it.
    // Since users are able to override our default components, we need to make sure that we do not break such
    // existing usage.
    // This is why we spread `components` after the default Builder.io components, but before the `props.customComponents`,
    // which is the new standard way of providing custom components, and must therefore take precedence.
    ...components,
    ...(customComponents || []),
  ].reduce<RegisteredComponents>(
    (acc, { component, ...info }) => ({
      ...acc,
      [info.name]: {
        component: component,
        ...serializeComponentInfo(info),
      },
    }),
    {}
  );
  let builderContextSignal = writable({
    content: getContentInitialValue({
      content: content,
      data: data,
    }),
    localState: undefined,
    rootState: getContextStateInitialValue({
      content: content,
      data: data,
      locale: locale,
    }),
    rootSetState: contentSetState,
    context: context || {},
    apiKey: apiKey,
    apiVersion: apiVersion,
    componentInfos: [
      ...getDefaultRegisteredComponents(),
      // While this `components` object is deprecated, we must maintain support for it.
      // Since users are able to override our default components, we need to make sure that we do not break such
      // existing usage.
      // This is why we spread `components` after the default Builder.io components, but before the `props.customComponents`,
      // which is the new standard way of providing custom components, and must therefore take precedence.
      ...components,
      ...(customComponents || []),
    ].reduce<Dictionary<ComponentInfo>>(
      (acc, { component: _, ...info }) => ({
        ...acc,
        [info.name]: serializeComponentInfo(info),
      }),
      {}
    ),
    inheritedStyles: {},
  });

  setContext(ComponentsContext.key, {
    registeredComponents: registeredComponents,
  });
</script>

<EnableEditor
  {content}
  {model}
  {context}
  {apiKey}
  {canTrack}
  {locale}
  {includeRefs}
  {enrich}
  {classNameProp}
  {showContent}
  {builderContextSignal}
  {...{}}
>
  {#if isSsrAbTest}
    <InlinedScript {scriptStr} />
  {/if}

  {#if TARGET !== "reactNative"}
    <ContentStyles
      contentId={$builderContextSignal.content?.id}
      cssCode={$builderContextSignal.content?.data?.cssCode}
      customFonts={$builderContextSignal.content?.data?.customFonts}
    />
  {/if}
  <Blocks
    blocks={$builderContextSignal.content?.data?.blocks}
    context={builderContextSignal}
    {registeredComponents}
  />
</EnableEditor>