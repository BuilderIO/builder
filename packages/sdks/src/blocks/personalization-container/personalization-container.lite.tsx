import { For, Fragment, Show, useStore } from '@builder.io/mitosis';
import Blocks from '../../components/blocks/blocks.lite.jsx';
import InlinedScript from '../../components/inlined-script.lite.jsx';
import InlinedStyles from '../../components/inlined-styles.lite.jsx';
import { filterWithCustomTargeting } from '../../functions/filter-with-custom-targeting.js';
import { userAttributesSubscriber } from '../../helpers/user-attributes.js';
import { getPersonalizationScript } from './helpers.js';
import type { PersonalizationContainerProps } from './personalization-container.types.js';

export default function PersonalizationContainer(
  props: PersonalizationContainerProps
) {
  const state = useStore({
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

  return (
    <Fragment>
      <div
        {...props.attributes}
        class={`builder-personalization-container ${props.attributes?.class || ''}`}
      >
        <Show when={typeof window === 'undefined'}>
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
            scriptStr={getPersonalizationScript(
              props.variants,
              props.builderBlock?.id || 'none',
              props.builderContext.value?.rootState?.locale as
                | string
                | undefined
            )}
            id={`variants-script-${props.builderBlock?.id}`}
          />
        </Show>
        <Show
          when={
            typeof props.previewingIndex === 'number' &&
            props.previewingIndex < (props.variants?.length || 0)
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
