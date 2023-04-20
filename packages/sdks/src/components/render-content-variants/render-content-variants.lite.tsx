import { For, Show, onInit, useStore } from '@builder.io/mitosis';
import { isBrowser } from '../../functions/is-browser';
import { getVariantsScriptString } from './helpers';
import RenderContent from '../render-content/render-content.lite';
import type { RenderContentProps } from '../render-content/render-content.types';
import { checkIsDefined } from '../../helpers/nullable';
import { handleABTestingSync } from '../../helpers/ab-tests';
import { TARGET } from '../../constants/target';

type VariantsProviderProps = RenderContentProps;

export default function RenderContentVariants(props: VariantsProviderProps) {
  const state = useStore({
    variantScriptStr: getVariantsScriptString(
      Object.values(props.content?.variations || {}).map((value) => ({
        id: value.id!,
        testRatio: value.testRatio,
      })),
      props.content?.id || ''
    ),

    variants: [
      ...Object.values(props.content?.variations || {}),
      props.content,
    ],

    contentToUse: handleABTestingSync({
      item: props.content!,
      canTrack: checkIsDefined(props.canTrack) ? props.canTrack : true,
    }),

    shouldRenderVariants:
      ((isBrowser() && props.canTrack) || !isBrowser()) &&
      Object.keys(props.content?.variations || {}).length > 0,
  });

  onInit(() => {
    if (TARGET === 'svelte' && state.shouldRenderVariants) {
      // get first template in loop
      const template = document.querySelector(
        `template[data-template-variant-id="${state.variants[0]?.id}"]`
      );
      // create and append script as sibling of template
      const script = document.createElement('script');
      script.id = `variants-script-${props.content?.id}`;
      script.innerHTML = state.variantScriptStr;
      template?.parentNode?.insertBefore(script, template);
    }
  });

  return (
    <Show
      when={state.shouldRenderVariants}
      else={
        <RenderContent
          content={state.contentToUse}
          apiKey={props.apiKey}
          apiVersion={props.apiVersion}
          canTrack={props.canTrack}
          customComponents={props.customComponents}
        />
      }
    >
      {/* render script that will remove non-winning variants */}
      <script
        id={`variants-script-${props.content?.id}`}
        innerHTML={state.variantScriptStr}
      ></script>
      <For each={state.variants}>
        {(variant) => (
          <template key={variant?.id} data-template-variant-id={variant?.id}>
            <RenderContent
              content={variant}
              apiKey={props.apiKey}
              apiVersion={props.apiVersion}
              canTrack={props.canTrack}
              customComponents={props.customComponents}
            />
          </template>
        )}
      </For>
    </Show>
  );
}
