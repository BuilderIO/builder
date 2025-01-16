import { For, onMount, Show, useMetadata, useStore } from '@builder.io/mitosis';
import Blocks from '../../components/blocks/blocks.lite.jsx';
import { checkShouldRenderVariants } from '../../components/content-variants/helpers.js';
import InlinedScript from '../../components/inlined-script.lite.jsx';
import InlinedStyles from '../../components/inlined-styles.lite.jsx';
import { filterWithCustomTargeting } from '../../functions/filter-with-custom-targeting.js';
import { isEditing } from '../../functions/is-editing.js';
import { getDefaultCanTrack } from '../../helpers/canTrack.js';
import { userAttributesSubscriber } from '../../helpers/user-attributes.js';
import { getPersonalizationScript } from './helpers.js';
import type { PersonalizationContainerProps } from './personalization-container.types.js';

useMetadata({
  rsc: {
    componentType: 'client',
  },
});

export default function PersonalizationContainer(
  props: PersonalizationContainerProps
) {
  const state = useStore({
    isMounted: false,
    shouldRenderVariants: checkShouldRenderVariants({
      canTrack: getDefaultCanTrack(props.builderContext.value?.canTrack),
      hasVariants: Boolean(props.variants?.length),
    }),
    get filteredVariants() {
      return (props.variants || []).filter((variant) => {
        return filterWithCustomTargeting(
          {
            ...(props.builderContext.value?.rootState?.locale
              ? { locale: props.builderContext.value?.rootState?.locale }
              : {}),
            ...(userAttributesSubscriber.getUserAttributes() as any),
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
    state.isMounted = true;
  });

  return (
    <div
      {...props.attributes}
      style={{
        opacity: state.isMounted || state.shouldRenderVariants ? 1 : 0,
        transition: 'opacity 0.2s ease-in-out',
        ...(props.attributes?.style || {}),
      }}
      class={`builder-personalization-container ${props.attributes?.class || ''}`}
    >
      <Show
        when={!state.shouldRenderVariants}
        else={
          <>
            <InlinedScript
              nonce={props.builderContext.value?.nonce || ''}
              scriptStr={getPersonalizationScript(
                props.variants,
                props.builderBlock?.id || 'none',
                props.builderContext.value?.rootState?.locale as
                  | string
                  | undefined
              )}
              id={`variants-script-${props.builderBlock?.id}`}
            />
            <InlinedStyles
              nonce={props.builderContext.value?.nonce || ''}
              styles={state.hideVariantsStyleString}
              id={`variants-styles-${props.builderBlock?.id}`}
            />
            <For each={props.variants}>
              {(variant, index) => (
                <div
                  key={index}
                  data-variant-id={`${props.builderBlock?.id}-${index}`}
                >
                  <Blocks
                    blocks={variant.blocks}
                    parent={props.builderBlock?.id}
                    path={`component.options.variants.${index}.blocks`}
                  />
                </div>
              )}
            </For>
            {props.children}
          </>
        }
      >
        <Show
          when={
            isEditing() &&
            typeof props.previewingIndex === 'number' &&
            props.previewingIndex < (props.variants?.length || 0)
          }
          else={
            <Show
              when={
                (isEditing() && typeof props.previewingIndex !== 'number') ||
                !state.isMounted ||
                !state.filteredVariants.length
              }
              else={
                <Blocks
                  key={`variant-${props.variants?.indexOf(state.winningVariant)}`}
                  blocks={state.winningVariant.blocks}
                  parent={props.builderBlock?.id}
                  path={`component.options.variants.${props.variants?.indexOf(
                    state.winningVariant
                  )}.blocks`}
                />
              }
            >
              {props.children}
            </Show>
          }
        >
          <Blocks
            key={`preview-${props.previewingIndex}`}
            blocks={props.variants?.[Number(props.previewingIndex)]?.blocks}
            parent={props.builderBlock?.id}
            path={`component.options.variants.${props.previewingIndex}.blocks`}
          />
        </Show>
      </Show>
    </div>
  );
}
