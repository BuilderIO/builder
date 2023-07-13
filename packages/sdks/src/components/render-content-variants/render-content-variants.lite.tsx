import { For, useStore, Show, useState } from '@builder.io/mitosis';
import {
  checkShouldRunVariants,
  getVariants,
  getVariantsScriptString,
} from './helpers';
import RenderContent from '../render-content/render-content.lite';
import type { RenderContentProps } from '../render-content/render-content.types';
import { getDefaultCanTrack } from '../../helpers/canTrack';
import InlinedStyles from '../inlined-styles.lite';
import { handleABTestingSync } from '../../helpers/ab-tests';
import InlinedScript from '../inlined-script.lite';

type VariantsProviderProps = RenderContentProps;

export default function RenderContentVariants(props: VariantsProviderProps) {
  const [shouldRenderVariants] = useState(
    checkShouldRunVariants({
      canTrack: getDefaultCanTrack(props.canTrack),
      content: props.content,
    })
  );

  const [variants] = useState(getVariants(props.content));

  const state = useStore({
    variantScriptStr: getVariantsScriptString(
      variants.map((value) => ({
        id: value.id!,
        testRatio: value.testRatio,
      })),
      props.content?.id || ''
    ),

    /**
     * TO-DO: maybe replace this with a style="display: none" on the divs to avoid React hydration issues?
     * Or maybe we can remove the display: none altogether since we're hiding the variants with HTML `hidden` attribute.
     *
     * Currently we get:
     * Warning: Prop `dangerouslySetInnerHTML` did not match.
     *  Server: ".variant-1d326d78efb04ce38467dd8f5160fab6 { display: none; } "
     *  Client: ".variant-d50b5d04edf640f195a7c42ebdb159b2 { display: none; } "
     */
    hideVariantsStyleString: variants
      .map((value) => `.variant-${value.id} { display: none; } `)
      .join(''),

    contentToRender: shouldRenderVariants
      ? props.content
      : handleABTestingSync({
          item: props.content,
          canTrack: getDefaultCanTrack(props.canTrack),
        }),
  });

  return (
    <>
      <Show when={shouldRenderVariants}>
        <InlinedStyles
          id={`variants-styles-${props.content?.id}`}
          styles={state.hideVariantsStyleString}
        />
        {/* Sets cookie for all `RenderContent` to read */}
        <InlinedScript
          id={`variants-script-${props.content?.id}`}
          scriptStr={state.variantScriptStr}
        />

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
              isSsrAbTest={shouldRenderVariants}
            />
          )}
        </For>
      </Show>
      <RenderContent
        model={props.model}
        content={state.contentToRender}
        apiKey={props.apiKey}
        apiVersion={props.apiVersion}
        canTrack={props.canTrack}
        customComponents={props.customComponents}
        classNameProp={`variant-${props.content?.id}`}
        parentContentId={props.content?.id}
        isSsrAbTest={shouldRenderVariants}
      />
    </>
  );
}
