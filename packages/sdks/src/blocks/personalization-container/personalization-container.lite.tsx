import {
  For,
  Fragment,
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
import { filterWithCustomTargeting } from '../../functions/filter-with-custom-targeting.js';
import { isEditing } from '../../functions/is-editing.js';
import { isPreviewing } from '../../functions/is-previewing.js';
import { getDefaultCanTrack } from '../../helpers/canTrack.js';
import { userAttributesService } from '../../helpers/user-attributes.js';
import {
  checkShouldRenderVariants,
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
    unsubscriber: null as null | (() => void),
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
    get winningVariant() {
      return state.filteredVariants[0];
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
      rootRef?.dispatchEvent(
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
          if (entry.isIntersecting) {
            rootRef?.dispatchEvent(
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

    state.unsubscriber = unsub;
  });

  onUnMount(() => {
    if (state.unsubscriber) {
      state.unsubscriber();
    }
  });

  return (
    <Fragment>
      <div
        ref={rootRef}
        {...props.attributes}
        class={`builder-personalization-container ${props.attributes?.class || ''}`}
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
        <Show
          when={
            state.isHydrated &&
            isEditing() &&
            typeof props.previewingIndex === 'number' &&
            props.previewingIndex < (props.variants?.length || 0) &&
            !state.filteredVariants.length
          }
          else={
            <Show
              when={state.winningVariant}
              else={
                <Blocks
                  blocks={props.builderBlock?.children}
                  parent={props.builderBlock?.id}
                />
              }
            >
              <Blocks
                blocks={state.winningVariant?.blocks}
                parent={props.builderBlock?.id}
                path={`component.options.variants.${props.variants?.indexOf(
                  state.winningVariant
                )}.blocks`}
              />
            </Show>
          }
        >
          <Blocks
            blocks={props.variants?.[Number(props.previewingIndex)]?.blocks}
            parent={props.builderBlock?.id}
            path={`component.options.variants.${props.previewingIndex}.blocks`}
          />
        </Show>
      </div>
    </Fragment>
  );
}
