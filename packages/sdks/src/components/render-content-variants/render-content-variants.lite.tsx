import { For, useMetadata, useStore } from '@builder.io/mitosis';
import { checkShouldRunVariants, getVariantsScriptString } from './helpers';
import RenderContent from '../render-content/render-content.lite';
import type { RenderContentProps } from '../render-content/render-content.types';
import { handleABTestingSync } from '../../helpers/ab-tests';
import { getDefaultCanTrack } from '../../helpers/canTrack';

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
    ScriptTag: 'script' as const,
    TemplateTag: 'template' as const,
  });

  // onInit(() => {
  //   if (isBrowser() && TARGET === 'svelte' && state.shouldRenderVariants) {
  //     // get first template in loop
  //     const templates = document.querySelectorAll(
  //       `template[data-template-variant-id="${props.content?.variations?.[0]?.id}"]`
  //     );
  //     const lastTemplate = templates[templates.length - 1];
  //     // create and append script as sibling of template
  //     const script = document.createElement('script');
  //     script.id = `variants-script-${props.content?.id}`;
  //     script.innerHTML = state.variantScriptStr;
  //     lastTemplate?.parentNode?.append(script, lastTemplate);
  //   }
  // });

  return (
    <Show
      when={state.shouldRenderVariants}
      else={
        <RenderContent
          content={handleABTestingSync({
            item: props.content,
            canTrack: getDefaultCanTrack(props.canTrack),
          })}
          apiKey={props.apiKey}
          apiVersion={props.apiVersion}
          canTrack={props.canTrack}
          customComponents={props.customComponents}
        />
      }
    >
      <For each={Object.values(props.content!.variations!)}>
        {(variant) => (
          <state.TemplateTag
            key={variant?.id}
            data-template-variant-id={variant?.id}
          >
            <RenderContent
              content={variant}
              apiKey={props.apiKey}
              apiVersion={props.apiVersion}
              canTrack={props.canTrack}
              customComponents={props.customComponents}
            />
          </state.TemplateTag>
        )}
      </For>

      {/**
       * Render the script that will remove non-winning variants.
       *
       * - It has to be after the `template`s so that it can choose the winning variant
       * - If it's after the default RenderContent, we will end up with a flash of content
       * - It has to be a blocking script so that it can select the winning variant before the web framework resumes/hydrates.
       *
       * That's why it's rendered between the `template`s and the default `RenderContent`.
       * */}
      <state.ScriptTag
        id={`variants-script-${props.content?.id}`}
        innerHTML={state.variantScriptStr}
      ></state.ScriptTag>

      <RenderContent
        content={props.content}
        apiKey={props.apiKey}
        apiVersion={props.apiVersion}
        canTrack={props.canTrack}
        customComponents={props.customComponents}
      />
    </Show>
  );
}
