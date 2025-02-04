import {
  For,
  onMount,
  onUnMount,
  Show,
  useMetadata,
  useRef,
  useStore,
} from '@builder.io/mitosis';
import Blocks from '../../components/blocks/blocks.lite.jsx';
import InlinedScript from '../../components/inlined-script.lite.jsx';
import InlinedStyles from '../../components/inlined-styles.lite.jsx';
import { isEditing } from '../../functions/is-editing.js';
import { isPreviewing } from '../../functions/is-previewing.js';
import { getDefaultCanTrack } from '../../helpers/canTrack.js';
import { userAttributesService } from '../../helpers/user-attributes.js';
import {
  checkShouldRenderVariants,
  filterWithCustomTargeting,
  getBlocksToRender,
  getPersonalizationScript,
} from './helpers.js';
import type { PersonalizationContainerProps } from './personalization-container.types.js';

useMetadata({
  rsc: {
    componentType: 'client',
  },
});

export default function PersonalizationContainer(
  props: PersonalizationContainerProps
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const state = useStore({
    userAttributes: userAttributesService.getUserAttributes(),
    scriptStr: getPersonalizationScript(
      props.variants,
      props.builderBlock?.id || 'none',
      props.builderContext.value?.rootState?.locale as string | undefined
    ),
    unsubscribers: [] as (() => void)[],
    shouldRenderVariants: checkShouldRenderVariants(
      props.variants,
      getDefaultCanTrack(props.builderContext.value?.canTrack)
    ),
    isHydrated: false,
    get filteredVariants() {
      return (props.variants || []).filter((variant) => {
        return filterWithCustomTargeting(
          {
            ...(props.builderContext.value?.rootState?.locale
              ? { locale: props.builderContext.value?.rootState?.locale }
              : {}),
            ...(state.userAttributes as any),
          },
          variant.query,
          variant.startDate,
          variant.endDate
        );
      });
    },
    get blocksToRender() {
      return getBlocksToRender({
        variants: props.variants,
        fallbackBlocks: props.builderBlock?.children,
        isHydrated: state.isHydrated,
        filteredVariants: state.filteredVariants,
        previewingIndex: props.previewingIndex,
      });
    },
    get hideVariantsStyleString() {
      return (props.variants || [])
        .map(
          (_, index) =>
            `[data-variant-id="${props.builderBlock?.id}-${index}"] { display: none; } `
        )
        .join('');
    },
  });

  onMount(() => {
    state.isHydrated = true;

    const unsub = userAttributesService.subscribeOnUserAttributesChange(
      (attrs) => {
        state.userAttributes = attrs;
      }
    );

    if (!(isEditing() || isPreviewing())) {
      const variant = state.filteredVariants[0];

      if (rootRef) {
        rootRef.dispatchEvent(
          new CustomEvent('builder.variantLoaded', {
            detail: {
              variant: variant || 'default',
              content: props.builderContext.value?.content,
            },
            bubbles: true,
          })
        );

        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && rootRef) {
              rootRef.dispatchEvent(
                new CustomEvent('builder.variantDisplayed', {
                  detail: {
                    variant: variant || 'default',
                    content: props.builderContext.value?.content,
                  },
                  bubbles: true,
                })
              );
            }
          });
        });

        observer.observe(rootRef);
      }
    }

    state.unsubscribers.push(unsub);
  });

  onUnMount(() => {
    state.unsubscribers.forEach((unsub) => unsub());
  });

  return (
    <div
      ref={rootRef}
      {...props.attributes}
      class={`builder-personalization-container ${
        props.attributes?.className || ''
      }`}
    >
      <Show when={state.shouldRenderVariants}>
        <For each={props.variants}>
          {(variant, index) => (
            <template
              key={index}
              data-variant-id={`${props.builderBlock?.id}-${index}`}
            >
              <Blocks
                blocks={variant.blocks}
                parent={props.builderBlock?.id}
                path={`component.options.variants.${index}.blocks`}
              />
            </template>
          )}
        </For>
        <InlinedStyles
          nonce={props.builderContext.value?.nonce || ''}
          styles={state.hideVariantsStyleString}
          id={`variants-styles-${props.builderBlock?.id}`}
        />
        <InlinedScript
          nonce={props.builderContext.value?.nonce || ''}
          scriptStr={state.scriptStr}
          id={`variants-script-${props.builderBlock?.id}`}
        />
      </Show>
      <Blocks
        blocks={state.blocksToRender.blocks}
        parent={props.builderBlock?.id}
        path={state.blocksToRender.path}
      />
    </div>
  );
}
