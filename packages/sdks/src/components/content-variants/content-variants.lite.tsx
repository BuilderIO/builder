import {
  For,
  useStore,
  Show,
  onMount,
  useTarget,
  useMetadata,
} from '@builder.io/mitosis';
import {
  checkShouldRunVariants,
  getScriptString,
  getVariants,
  getVariantsScriptString,
} from './helpers.js';
import ContentComponent from '../content/content.lite.jsx';
import { getDefaultCanTrack } from '../../helpers/canTrack.js';
import InlinedStyles from '../inlined-styles.lite.jsx';
import { handleABTestingSync } from '../../helpers/ab-tests.js';
import InlinedScript from '../inlined-script.lite.jsx';
import { TARGET } from '../../constants/target.js';
import type { ContentVariantsPrps } from './content-variants.types.js';

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
      vue2: () => {
        state.shouldRenderVariants = false;
      },
      vue3: () => {
        state.shouldRenderVariants = false;
      },
    });
  });

  const state = useStore({
    shouldRenderVariants: checkShouldRunVariants({
      canTrack: getDefaultCanTrack(props.canTrack),
      content: props.content,
    }),
    get variantScriptStr() {
      return getVariantsScriptString(
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
        <InlinedScript scriptStr={state.variantScriptStr} />

        <For each={getVariants(props.content)}>
          {(variant) => (
            <ContentComponent
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
      <ContentComponent
        {...useTarget({
          vue2: {
            key: state.shouldRenderVariants.toString(),
          },
          vue3: {
            key: state.shouldRenderVariants.toString(),
          },
          default: {},
        })}
        content={state.defaultContent}
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
