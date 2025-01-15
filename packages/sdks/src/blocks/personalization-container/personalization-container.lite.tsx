import { onMount, Show, useMetadata, useStore } from '@builder.io/mitosis';
import Blocks from '../../components/blocks/blocks.lite.jsx';
import InlinedScript from '../../components/inlined-script.lite.jsx';
import { filterWithCustomTargeting } from '../../functions/filter-with-custom-targeting.js';
import { isEditing } from '../../functions/is-editing.js';
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
    isClient: false,
    get filteredVariants() {
      return (props.variants || []).filter((variant) => {
        return filterWithCustomTargeting(
          {
            ...({} as any),
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
  });

  onMount(() => {
    state.isClient = true;
  });

  return (
    <div
      {...props.attributes}
      style={{
        opacity: state.isClient ? 1 : 0,
        transition: 'opacity 0.2s ease-in-out',
        ...(props.attributes?.style || {}),
      }}
      class={`builder-personalization-container ${props.attributes?.class || ''} ${
        state.isClient ? '' : 'builder-personalization-container-loading'
      }`}
    >
      <InlinedScript
        nonce={props.builderContext.value?.nonce || ''}
        scriptStr={getPersonalizationScript(
          props.variants,
          props.builderBlock?.id
        )}
        id={`variants-script-${props.builderBlock?.id}`}
      />
      <Show
        when={isEditing() && typeof props.previewingIndex === 'number'}
        else={
          <Show
            when={state.isClient && state.winningVariant}
            else={props.children}
          >
            <Blocks
              key={`variant-${props.variants?.indexOf(state.winningVariant)}`}
              blocks={state.winningVariant.blocks}
              parent={props.builderBlock?.id}
              path={`component.options.variants.${props.variants?.indexOf(
                state.winningVariant
              )}.blocks`}
            />
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
    </div>
  );
}
