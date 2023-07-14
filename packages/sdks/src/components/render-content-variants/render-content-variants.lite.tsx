import { For, useStore, Show, onMount, useTarget } from '@builder.io/mitosis';
import {
  checkShouldRunVariants,
  getScriptString,
  getVariants,
  getVariantsScriptString,
} from './helpers';
import RenderContent from '../render-content/render-content.lite';
import { getDefaultCanTrack } from '../../helpers/canTrack';
import InlinedStyles from '../inlined-styles.lite';
import { handleABTestingSync } from '../../helpers/ab-tests';
import InlinedScript from '../inlined-script.lite';
import { TARGET } from '../../constants/target';
import type { RenderContentVariantsProps } from './render-content-variants.types';

type VariantsProviderProps = RenderContentVariantsProps & {
  /**
   * For internal use only. Do not provide this prop.
   */
  __isNestedRender?: boolean;
};

export default function RenderContentVariants(props: VariantsProviderProps) {
  onMount(() => {
    /**
     * We unmount the non-winning variants post-hydration in Vue.
     */
    if (TARGET === 'vue2' || TARGET === 'vue3') {
      state.shouldRenderVariants = false;
    }
  });
  const state = useStore({
    shouldRenderVariants: checkShouldRunVariants({
      canTrack: getDefaultCanTrack(props.canTrack),
      content: props.content,
    }),
    variantScriptStr: getVariantsScriptString(
      getVariants(props.content).map((value) => ({
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
    hideVariantsStyleString: getVariants(props.content)
      .map((value) => `.variant-${value.id} { display: none; } `)
      .join(''),
  });

  return (
    <>
      <Show when={!props.__isNestedRender && TARGET !== 'reactNative'}>
        <InlinedScript scriptStr={getScriptString()} />
      </Show>
      <Show when={state.shouldRenderVariants}>
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
              showContent={false}
              classNameProp={undefined}
              model={props.model}
              data={props.data}
              context={props.context}
              apiKey={props.apiKey}
              apiVersion={props.apiVersion}
              customComponents={props.customComponents}
              canTrack={props.canTrack}
              locale={props.locale}
              includeRefs={props.includeRefs}
              enrich={props.enrich}
              isSsrAbTest={state.shouldRenderVariants}
              parentContentId={props.content?.id}
            />
          )}
        </For>
      </Show>
      <RenderContent
        {...useTarget({
          vue2: {
            key: state.shouldRenderVariants.toString(),
          },
          vue3: {
            key: state.shouldRenderVariants.toString(),
          },
          default: {},
        })}
        content={
          state.shouldRenderVariants
            ? props.content
            : handleABTestingSync({
                item: props.content,
                canTrack: getDefaultCanTrack(props.canTrack),
              })
        }
        classNameProp={`variant-${props.content?.id}`}
        showContent
        model={props.model}
        data={props.data}
        context={props.context}
        apiKey={props.apiKey}
        apiVersion={props.apiVersion}
        customComponents={props.customComponents}
        canTrack={props.canTrack}
        locale={props.locale}
        includeRefs={props.includeRefs}
        enrich={props.enrich}
        isSsrAbTest={state.shouldRenderVariants}
        parentContentId={props.content?.id}
      />
    </>
  );
}
