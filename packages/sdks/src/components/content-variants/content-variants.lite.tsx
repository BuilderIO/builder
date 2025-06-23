import {
  For,
  Show,
  onMount,
  useMetadata,
  useStore,
  useTarget,
} from '@builder.io/mitosis';
import {
  SDKS_SUPPORTING_PERSONALIZATION,
  getInitPersonalizationVariantsFnsScriptString,
} from '../../blocks/personalization-container/helpers.js';
import { TARGET } from '../../constants/target.js';
import { handleABTestingSync } from '../../helpers/ab-tests.js';
import { getDefaultCanTrack } from '../../helpers/canTrack.js';
import { BuilderContent } from '../../types/builder-content.js';
import { Nullable } from '../../types/typescript.js';
import ContentComponent from '../content/content.lite.jsx';
import InlinedScript from '../inlined-script.lite.jsx';
import InlinedStyles from '../inlined-styles.lite.jsx';
import type { ContentVariantsPrps } from './content-variants.types.js';
import {
  checkShouldRenderVariants,
  getInitVariantsFnsScriptString,
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
  angular: {
    selector: 'builder-content, content-variants',
  },
});

type VariantsProviderProps = ContentVariantsPrps & {
  /**
   * For internal use only. Do not provide this prop.
   */
  isNestedRender?: boolean;
  /**
   * Render callback function similar to gen1 BuilderContent.
   * Receives the processed data, loading state, and full content.
   */
  render?: (
    data: any, // A/B tested data (winning variant)
    fullContent: Nullable<BuilderContent> // Original content with all variations
  ) => React.ReactElement;
};

export default function ContentVariants(props: VariantsProviderProps) {
  onMount(() => {
    /**
     * For Solid/Svelte: we unmount the non-winning variants post-hydration.
     */
    useTarget({
      solid: () => {
        state.shouldRenderVariants = false;
      },
      svelte: () => {
        state.shouldRenderVariants = false;
      },
    });
  });

  const state = useStore({
    renderData: null,
    loading: true,
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
      <>
        {' '}
        <Show when={!props.isNestedRender && TARGET !== 'reactNative'}>
          <InlinedScript
            scriptStr={getInitVariantsFnsScriptString()}
            id="builderio-init-variants-fns"
            nonce={props.nonce || ''}
          />
          {SDKS_SUPPORTING_PERSONALIZATION.includes(TARGET) && (
            <InlinedScript
              nonce={props.nonce || ''}
              scriptStr={getInitPersonalizationVariantsFnsScriptString()}
              id="builderio-init-personalization-variants-fns"
            />
          )}
        </Show>
        <Show when={state.shouldRenderVariants}>
          <InlinedStyles
            id="builderio-variants"
            styles={state.hideVariantsStyleString}
            nonce={props.nonce || ''}
          />
          {/* Sets A/B test cookie for all `RenderContent` to read */}
          <InlinedScript
            id="builderio-variants-visibility"
            scriptStr={state.updateCookieAndStylesScriptStr}
            nonce={props.nonce || ''}
          />

          <For each={getVariants(props.content)}>
            {(variant) => (
              <ContentComponent
                apiHost={props.apiHost}
                isNestedRender={props.isNestedRender}
                key={variant.testVariationId}
                nonce={props.nonce}
                content={variant}
                showContent={false}
                model={props.model}
                data={props.data}
                context={props.context}
                apiKey={props.apiKey}
                apiVersion={props.apiVersion}
                customComponents={props.customComponents}
                linkComponent={props.linkComponent}
                canTrack={props.canTrack}
                locale={props.locale}
                enrich={props.enrich}
                isSsrAbTest={state.shouldRenderVariants}
                blocksWrapper={props.blocksWrapper}
                blocksWrapperProps={props.blocksWrapperProps}
                contentWrapper={props.contentWrapper}
                contentWrapperProps={props.contentWrapperProps}
                trustedHosts={props.trustedHosts}
                {...useTarget({
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-expect-error
                  reactNative: { strictStyleMode: props.strictStyleMode },
                  default: {},
                })}
              />
            )}
          </For>
        </Show>
      </>

      {/* Render callback or default content */}
      {props.render ? (
        (() => {
          return props.render(
            props.content?.data || null,
            props.content || null
          );
        })()
      ) : (
        <>
          <ContentComponent
            apiHost={props.apiHost}
            nonce={props.nonce}
            isNestedRender={props.isNestedRender}
            {...useTarget({
              vue: { key: state.shouldRenderVariants.toString() },
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-expect-error
              reactNative: { strictStyleMode: props.strictStyleMode },
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
            linkComponent={props.linkComponent}
            canTrack={props.canTrack}
            locale={props.locale}
            enrich={props.enrich}
            isSsrAbTest={state.shouldRenderVariants}
            blocksWrapper={props.blocksWrapper}
            blocksWrapperProps={props.blocksWrapperProps}
            contentWrapper={props.contentWrapper}
            contentWrapperProps={props.contentWrapperProps}
            trustedHosts={props.trustedHosts}
          />
        </>
      )}
    </>
  );
}
