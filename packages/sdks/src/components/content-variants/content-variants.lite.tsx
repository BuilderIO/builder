import { For, useStore, Show, onMount, useTarget } from '@builder.io/mitosis';
import {
  checkShouldRunVariants,
  getScriptString,
  getVariants,
  getVariantsScriptString,
} from './helpers';
import Content from '../content/content.lite';
import type { ContentProps } from '../content/content.types';
import { getDefaultCanTrack } from '../../helpers/canTrack';
import InlinedStyles from '../inlined-styles.lite';
import { handleABTestingSync } from '../../helpers/ab-tests';
import InlinedScript from '../inlined-script.lite';
import { TARGET } from '../../constants/target';

type VariantsProviderProps = ContentProps & {
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
        id: value.testVariationId!,
        testRatio: value.testRatio,
      })),
      props.content?.id || ''
    ),

    hideVariantsStyleString: getVariants(props.content)
      .map((value) => `.variant-${value.testVariationId} { display: none; } `)
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
        {/* Sets A/B test cookie for all `RenderContent` to read */}
        <InlinedScript scriptStr={state.variantScriptStr} />

        <For each={getVariants(props.content)}>
          {(variant) => (
            <Content
              key={variant.testVariationId}
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
            />
          )}
        </For>
      </Show>
      <Content
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
      />
    </>
  );
}
