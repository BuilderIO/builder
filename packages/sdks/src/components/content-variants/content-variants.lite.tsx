import {
  For,
  Show,
  onMount,
  useMetadata,
  useStore,
  useTarget,
} from '@builder.io/mitosis';
import { TARGET } from '../../constants/target.js';
import { handleABTestingSync } from '../../helpers/ab-tests.js';
import { getDefaultCanTrack } from '../../helpers/canTrack.js';
import ContentComponent from '../content/content.lite.jsx';
import InlinedScript from '../inlined-script.lite.jsx';
import InlinedStyles from '../inlined-styles.lite.jsx';
import type { ContentVariantsPrps } from './content-variants.types.js';
import {
  checkShouldRenderVariants,
  getScriptString,
  getUpdateCookieAndStylesScript,
  getVariants,
} from './helpers.js';

useMetadata({
  rsc: {
    componentType: 'server',
  },
  qwik: {
    setUseStoreFirst: true,
  },
});

type VariantsProviderProps = ContentVariantsPrps & {
  /**
   * For internal use only. Do not provide this prop.
   */
  __isNestedRender?: boolean;
};

export default function ContentVariants(props: VariantsProviderProps) {
  onMount(() => {
    /**
     * We unmount the non-winning variants post-hydration in Vue.
     */
    useTarget({
      vue: () => {
        state.shouldRenderVariants = false;
      },
      solid: () => {
        state.shouldRenderVariants = false;
      },
      svelte: () => {
        state.shouldRenderVariants = false;
      },
    });
  });

  const state = useStore({
    shouldRenderVariants: checkShouldRenderVariants({
      canTrack: getDefaultCanTrack(props.canTrack),
      content: props.content,
    }),
    get updateCookieAndStylesScriptStr() {
      return getUpdateCookieAndStylesScript(
        getVariants(props.content).map((value) => ({
          id: value.testVariationId!,
          testRatio: value.testRatio,
        })),
        props.content?.id || ''
      );
    },

    get hideVariantsStyleString() {
      return getVariants(props.content)
        .map((value) => `.variant-${value.testVariationId} { display: none; } `)
        .join('');
    },
    get defaultContent() {
      return state.shouldRenderVariants
        ? { ...props.content, testVariationId: props.content?.id }
        : handleABTestingSync({
            item: props.content,
            canTrack: getDefaultCanTrack(props.canTrack),
          });
    },
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
        <InlinedScript scriptStr={state.updateCookieAndStylesScriptStr} />

        <For each={getVariants(props.content)}>
          {(variant) => (
            <ContentComponent
              key={variant.testVariationId}
              content={variant}
              showContent={false}
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
              blocksWrapper={props.blocksWrapper}
              blocksWrapperProps={props.blocksWrapperProps}
              contentWrapper={props.contentWrapper}
              contentWrapperProps={props.contentWrapperProps}
            />
          )}
        </For>
      </Show>
      <ContentComponent
        {...useTarget({
          vue: { key: state.shouldRenderVariants.toString() },
          default: {},
        })}
        content={state.defaultContent}
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
        blocksWrapper={props.blocksWrapper}
        blocksWrapperProps={props.blocksWrapperProps}
        contentWrapper={props.contentWrapper}
        contentWrapperProps={props.contentWrapperProps}
      />
    </>
  );
}
