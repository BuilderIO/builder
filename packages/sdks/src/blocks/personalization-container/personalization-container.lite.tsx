import {
  For,
  onMount,
  onUnMount,
  Show,
  useMetadata,
  useRef,
  useStore,
  useTarget,
} from '@builder.io/mitosis';
import Blocks from '../../components/blocks/blocks.lite.jsx';
import InlinedScript from '../../components/inlined-script.lite.jsx';
import InlinedStyles from '../../components/inlined-styles.lite.jsx';
import { isEditing } from '../../functions/is-editing.js';
import { isPreviewing } from '../../functions/is-previewing.js';
import { getDefaultCanTrack } from '../../helpers/canTrack.js';
import { userAttributesService } from '../../helpers/user-attributes.js';
import { filterAttrs } from '../helpers.js';
import {
  checkShouldRenderVariants,
  filterWithCustomTargeting,
  getBlocksToRender,
  getPersonalizationScript,
  getUpdateVisibilityStylesScript,
} from './helpers.js';
import type { PersonalizationContainerProps } from './personalization-container.types.js';
/**
 * This import is used by the Svelte SDK. Do not remove.
 */
import { getClassPropName } from '../../functions/get-class-prop-name.js';
import { setAttrs } from '../helpers.js';

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
    updateVisibilityStylesScript: getUpdateVisibilityStylesScript(
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
    get attrs() {
      return {
        ...useTarget({
          vue: filterAttrs(props.attributes, 'v-on:', false),
          svelte: filterAttrs(props.attributes, 'on:', false),
          default: props.attributes,
        }),
        ...useTarget({
          vue: filterAttrs(props.attributes, 'v-on:', true),
          svelte: filterAttrs(props.attributes, 'on:', true),
          default: {},
        }),
        [getClassPropName()]: `builder-personalization-container ${props.attributes[getClassPropName()] || ''}`,
      };
    },
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
            `div[data-variant-id="${props.builderBlock?.id}-${index}"] { display: none !important; } `
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
    <div ref={rootRef} {...state.attrs}>
      <Show when={state.isHydrated}>
        <Blocks
          blocks={state.blocksToRender.blocks}
          parent={props.builderBlock?.id}
          path={state.blocksToRender.path}
          context={props.builderContext}
          registeredComponents={props.builderComponents}
          extraAttributesForBlocksWrapper={{
            'data-variant-id': `${props.builderBlock?.id}-default`,
          }}
        ></Blocks>
      </Show>
      <Show when={!state.isHydrated}>
        <Show when={state.shouldRenderVariants}>
          <InlinedStyles
            nonce={props.builderContext.value?.nonce || ''}
            styles={state.hideVariantsStyleString}
            id={`variants-styles-${props.builderBlock?.id}`}
          />
          <InlinedScript
            nonce={props.builderContext.value?.nonce || ''}
            scriptStr={state.updateVisibilityStylesScript}
            id={`variants-visibility-script-${props.builderBlock?.id}`}
          />
          <For each={props.variants}>
            {(variant, index) => (
              <Blocks
                extraAttributesForBlocksWrapper={{
                  'aria-hidden': true,
                  hidden: true,
                  'data-variant-id': `${props.builderBlock?.id}-${index}`,
                }}
                blocks={variant.blocks}
                parent={props.builderBlock?.id}
                path={`component.options.variants.${index}.blocks`}
                context={props.builderContext}
                registeredComponents={props.builderComponents}
              >
                <InlinedScript
                  nonce={props.builderContext.value?.nonce || ''}
                  scriptStr={state.scriptStr}
                  id={`variants-script-${props.builderBlock?.id}-${index}`}
                />
              </Blocks>
            )}
          </For>
        </Show>
        <Blocks
          blocks={state.blocksToRender.blocks}
          parent={props.builderBlock?.id}
          path={state.blocksToRender.path}
          context={props.builderContext}
          registeredComponents={props.builderComponents}
          extraAttributesForBlocksWrapper={{
            'data-variant-id': `${props.builderBlock?.id}-default`,
          }}
        >
          <Show when={state.shouldRenderVariants}>
            <InlinedScript
              nonce={props.builderContext.value?.nonce || ''}
              scriptStr={state.scriptStr}
              id={`variants-script-${props.builderBlock?.id}-default`}
            />
          </Show>
        </Blocks>
      </Show>
    </div>
  );
}
