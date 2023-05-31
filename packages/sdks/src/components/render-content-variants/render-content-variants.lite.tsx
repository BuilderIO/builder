import { For, useMetadata, useStore, Show } from '@builder.io/mitosis';
import { checkShouldRunVariants, getVariantsScriptString } from './helpers';
import RenderContent from '../render-content/render-content.lite';
import type { RenderContentProps } from '../render-content/render-content.types';
import { getDefaultCanTrack } from '../../helpers/canTrack';
import RenderInlinedStyles from '../render-inlined-styles.lite';

type VariantsProviderProps = RenderContentProps;

useMetadata({
  elementTag: ['state.ScriptTag', 'state.TemplateTag'],
});

export default function RenderContentVariants(props: VariantsProviderProps) {
  const state = useStore({
    variantScriptStr: getVariantsScriptString(
      Object.values(props.content?.variations || {}).map((value) => ({
        id: value.id!,
        testRatio: value.testRatio,
      })),
      props.content?.id || ''
    ),

    shouldRenderVariants: checkShouldRunVariants({
      canTrack: getDefaultCanTrack(props.canTrack),
      content: props.content,
    }),
    hideVariantsStyleString: Object.values(props.content?.variations || {})
      .map((value) => `.variant-${value.id} { display: none; } `)
      .join(''),

    ScriptTag: 'script' as const,
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

        <For each={Object.values(props.content!.variations || [])}>
          {(variant) => (
            <RenderContent
              content={variant}
              apiKey={props.apiKey}
              apiVersion={props.apiVersion}
              canTrack={props.canTrack}
              customComponents={props.customComponents}
              hideContent
              parentContentId={props.content?.id}
            />
          )}
        </For>
      </Show>
      <RenderContent
        content={props.content}
        apiKey={props.apiKey}
        apiVersion={props.apiVersion}
        canTrack={props.canTrack}
        customComponents={props.customComponents}
        classNameProp={`variant-${props.content?.id}`}
        parentContentId={props.content?.id}
      />
    </>
  );
}
