import { For, useMetadata, useStore, Show, onMount } from '@builder.io/mitosis';
import {
  checkShouldRunVariants,
  getVariants,
  getVariantsScriptString,
} from './helpers';
import RenderContent from '../render-content/render-content.lite';
import type { RenderContentProps } from '../render-content/render-content.types';
import { getDefaultCanTrack } from '../../helpers/canTrack';
import RenderInlinedStyles from '../render-inlined-styles.lite';
import { handleABTestingSync } from '../../helpers/ab-tests';

type VariantsProviderProps = RenderContentProps;

useMetadata({
  elementTag: ['state.ScriptTag', 'state.TemplateTag'],
});

export default function RenderContentVariants(props: VariantsProviderProps) {
  const state = useStore({
    variantScriptStr: getVariantsScriptString(
      getVariants(props.content).map((value) => ({
        id: value.id!,
        testRatio: value.testRatio,
      })),
      props.content?.id || ''
    ),

    shouldRenderVariants: checkShouldRunVariants({
      canTrack: getDefaultCanTrack(props.canTrack),
      content: props.content,
    }),

    /**
     * TO-DO: maybe replace this with a style="display: none" on the divs to avoid React hydration issues?
     * Or maybe we can remove the display: none altogether since we're hiding the variants with HTML `hidden` attribute.
     *
     * Currently we get:
     * Warning: Prop `dangerouslySetInnerHTML` did not match.
     *  Server: ".variant-1d326d78efb04ce38467dd8f5160fab6 { display: none; } "
     *  Client: ".variant-d50b5d04edf640f195a7c42ebdb159b2 { display: none; } "
     */
    hideVariantsStyleString: getVariants(props.content)
      .map((value) => `.variant-${value.id} { display: none; } `)
      .join(''),

    ScriptTag: 'script' as const,

    contentToRender: checkShouldRunVariants({
      canTrack: getDefaultCanTrack(props.canTrack),
      content: props.content,
    })
      ? props.content
      : handleABTestingSync({
          item: props.content,
          canTrack: getDefaultCanTrack(props.canTrack),
        }),
  });

  /**
   * This is needed for hydration-based frameworks like React, so that:
   * - the first client-side render is the same as the server-side render (`shouldRenderVariants` starts as `true`)
   * - subsequent client-side renders are different from the server-side render (`shouldRenderVariants` is set to `false`)
   */
  onMount(() => {
    state.shouldRenderVariants = false;
  });

  return (
    <>
      <Show when={state.shouldRenderVariants}>
        <RenderInlinedStyles
          id={`variants-styles-${props.content?.id}`}
          styles={state.hideVariantsStyleString}
        />
        {/* Sets cookie for all `RenderContent` to read */}
        <state.ScriptTag
          id={`variants-script-${props.content?.id}`}
          innerHTML={state.variantScriptStr}
        ></state.ScriptTag>

        <For each={getVariants(props.content)}>
          {(variant) => (
            <RenderContent
              key={variant.id}
              content={variant}
              apiKey={props.apiKey}
              apiVersion={props.apiVersion}
              canTrack={props.canTrack}
              customComponents={props.customComponents}
              hideContent
              parentContentId={props.content?.id}
              isSsrAbTest
            />
          )}
        </For>
      </Show>
      <RenderContent
        content={state.contentToRender}
        apiKey={props.apiKey}
        apiVersion={props.apiVersion}
        canTrack={props.canTrack}
        customComponents={props.customComponents}
        classNameProp={`variant-${props.content?.id}`}
        parentContentId={props.content?.id}
        isSsrAbTest={state.shouldRenderVariants}
      />
    </>
  );
}
