import { For, Show, useRef, useStore, useTarget } from '@builder.io/mitosis';
import Blocks from '../../components/blocks/index.js';
import type { AccordionProps } from './accordion.types.js';

export default function Accordion(props: AccordionProps) {
  const state = useStore({
    open: [] as number[],
    get onlyOneAtATime() {
      return Boolean(props.grid || props.oneAtATime);
    },
    get accordionStyles() {
      const styles = useTarget({
        reactNative: {
          display: 'flex' as 'flex' | 'none',
          flexDirection: 'column' as 'row' | 'column' | 'column-reverse',
        },
        default: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          cursor: 'pointer',
        },
      });
      return Object.fromEntries(
        Object.entries(styles).filter(([_, value]) => value !== undefined)
      );
    },
    gridStyles(index: number) {
      if (!props.grid) {
        return {};
      }
      const gridItemOrder = state.openGridItemOrder();
      return {
        width: props.gridRowWidth,
        ...(typeof gridItemOrder === 'number' && {
          order: index < gridItemOrder ? index : index + 1,
        }),
      };
    },
    openGridItemOrder(): number | null {
      let itemOrder: number | null = null;
      const getOpenGridItemPosition = props.grid && state.open.length;
      if (getOpenGridItemPosition && divRef) {
        const openItemIndex = state.open[0];
        const openItem = divRef.querySelector(
          `.builder-accordion-title[data-index="${openItemIndex}"]`
        );

        let subjectItem = openItem;
        itemOrder = openItemIndex;

        if (subjectItem) {
          let prevItemRect = subjectItem.getBoundingClientRect();

          while (
            (subjectItem = subjectItem && subjectItem.nextElementSibling)
          ) {
            if (subjectItem) {
              if (subjectItem.classList.contains('builder-accordion-detail')) {
                continue;
              }
              const subjectItemRect = subjectItem.getBoundingClientRect();
              if (subjectItemRect.left > prevItemRect.left) {
                const index = parseInt(
                  subjectItem.getAttribute('data-index') || '',
                  10
                );
                if (!isNaN(index)) {
                  prevItemRect = subjectItemRect;
                  itemOrder = index;
                }
              } else {
                break;
              }
            }
          }
        }
      }

      if (typeof itemOrder === 'number') {
        itemOrder = itemOrder + 1;
      }

      return itemOrder;
    },
  });

  const divRef = useRef<any>();

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
          <>
            <div
              class={`builder-accordion-title builder-accordion-title-${
                state.open.includes(index) ? 'open' : 'closed'
              }`}
              style={{
                ...state.accordionStyles,
                ...state.gridStyles(index),
              }}
              data-index={index}
              onClick={() => {
                if (state.open.includes(index)) {
                  state.open = state.onlyOneAtATime
                    ? []
                    : state.open.filter((item) => item !== index);
                } else {
                  state.open = state.onlyOneAtATime
                    ? [index]
                    : state.open.concat(index);
                }
              }}
            >
              <Blocks
                blocks={item.title}
                path={`items.${index}.title`}
                parent={props.builderBlock.id}
                context={props.builderContext}
                registeredComponents={props.builderComponents}
                linkComponent={props.builderLinkComponent}
              />
            </div>
            <Show when={state.open.includes(index)}>
              <div
                class={`builder-accordion-detail builder-accordion-detail-${
                  state.open.includes(index) ? 'open' : 'closed'
                }`}
                style={{
                  order:
                    typeof state.openGridItemOrder() === 'number'
                      ? (state.openGridItemOrder() as any)
                      : undefined,
                  ...(props.grid && {
                    width: '100%',
                  }),
                }}
              >
                <Blocks
                  blocks={item.detail}
                  path={`items.${index}.detail`}
                  parent={props.builderBlock.id}
                  context={props.builderContext}
                  registeredComponents={props.builderComponents}
                  linkComponent={props.builderLinkComponent}
                />
              </div>
            </Show>
          </>
        )}
      </For>
    </div>
  );
}
