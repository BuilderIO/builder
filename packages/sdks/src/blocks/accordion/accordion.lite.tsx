import { For, Show, onMount, useRef, useStore } from '@builder.io/mitosis';
import type { BuilderBlock } from '../../types/builder-block.js';
import Blocks from '../../components/blocks/index.js';

interface AccordionProps {
  items: {
    title: BuilderBlock[];
    detail: BuilderBlock[];
  }[];
  oneAtATime?: boolean;
  grid?: boolean;
  gridRowWidth?: number;
  useChildrenForItems?: boolean;
}

export default function Accordion(props: AccordionProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const state = useStore({
    open: [] as number[],
    onClick: (index: number) => {
      state.open = state.open.includes(index)
        ? state.open.filter((item) => item !== index)
        : props.oneAtATime || props.grid
        ? [index]
        : [...state.open, index];
    },
    get onlyOneAtATime() {
      return Boolean(props.grid || props.oneAtATime);
    },
    isOpen(index: number) {
      return state.open.includes(index);
    },
  });

  onMount(() => {
    setTimeout(() => {
      if (divRef) {
        divRef.dispatchEvent(
          new CustomEvent('builder:accordion:load', {
            bubbles: true,
            cancelable: false,
            detail: {
              ref: divRef,
            },
          })
        );
      }
    });
  });

  return (
    <div
      ref={divRef}
      class="builder-accordion"
      style={{
        display: 'flex',
        alignItems: 'stretch',
        flexDirection: 'column',
        ...(props.grid && {
          flexDirection: 'row',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }),
      }}
    >
      <For each={props.items}>
        {(item, index) => (
          <div key={index}>
            <div>
              <div
                class={`builder-accordion-title builder-accordion-title-${
                  state.isOpen(index) ? 'open' : 'closed'
                }`}
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'stretch',
                }}
                data-index={index}
                onClick={() => state.onClick(index)}
              >
                <Blocks blocks={item.title} path={`items.${index}.title`} />
              </div>
              <Show when={state.isOpen(index)}>
                <div
                  class={`builder-accordion-detail builder-accordion-detail-${
                    state.isOpen(index) ? 'open' : 'closed'
                  }`}
                >
                  <Blocks blocks={item.detail} path={`items.${index}.detail`} />
                </div>
              </Show>
            </div>
          </div>
        )}
      </For>
    </div>
  );
}
