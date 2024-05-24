import { For, Show, useRef, useStore, useTarget } from '@builder.io/mitosis';
import Blocks from '../../components/blocks/index.js';
import type { AccordionProps } from './accordion.types.js';
import type { Dictionary } from '../../types/typescript.js';
import { camelCaseToKebabCase } from '../../components/block/animator.js';

export default function Accordion(props: AccordionProps) {
  const state = useStore({
    open: [] as number[],
    get onlyOneAtATime() {
      return Boolean(props.grid || props.oneAtATime);
    },
    get accordionStyles(): Dictionary<string> {
      const styles = {
        display: 'flex' as 'flex' | 'none',
        alignItems: 'stretch' as
          | 'stretch'
          | 'flex-start'
          | 'flex-end'
          | 'center'
          | 'baseline',
        flexDirection: 'column' as
          | 'column'
          | 'row'
          | 'column-reverse'
          | 'row-reverse',
        ...(props.grid && {
          flexDirection: 'row' as
            | 'column'
            | 'row'
            | 'column-reverse'
            | 'row-reverse',
          alignItems: 'flex-start' as
            | 'stretch'
            | 'flex-start'
            | 'flex-end'
            | 'center'
            | 'baseline',
          flexWrap: 'wrap' as 'nowrap' | 'wrap',
        }),
      };
      return useTarget({
        solid: Object.fromEntries(
          Object.entries(styles).map(([key, value]) => [
            camelCaseToKebabCase(key),
            value,
          ])
        ),
        default: styles,
      });
    },
    get accordionTitleStyles(): Dictionary<string> {
      const shared = {
        display: 'flex',
        flexDirection: 'column',
      };
      const styles = useTarget({
        reactNative: shared,
        solid: Object.fromEntries(
          Object.entries({
            ...shared,
            alignItems: 'stretch',
            cursor: 'pointer',
          }).map(([key, value]) => [camelCaseToKebabCase(key), value])
        ),
        default: { ...shared, alignItems: 'stretch', cursor: 'pointer' },
      });
      return Object.fromEntries(
        Object.entries(styles).filter(([_, value]) => value !== undefined)
      ) as Dictionary<string>;
    },
    getAccordionTitleClassName(index: number) {
      return `builder-accordion-title builder-accordion-title-${
        state.open.includes(index) ? 'open' : 'closed'
      }`;
    },
    getAccordionDetailClassName(index: number) {
      return `builder-accordion-detail builder-accordion-detail-${
        state.open.includes(index) ? 'open' : 'closed'
      }`;
    },
    get openGridItemOrder(): number | null {
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
    gridStyles(index: number) {
      if (!props.grid) {
        return {};
      }
      const order = state.openGridItemOrder;
      return useTarget({
        reactNative: {
          width: props.gridRowWidth,
        },
        default: {
          width: props.gridRowWidth,
          ...(typeof order === 'number' && {
            order: index < (order as number) ? index : index + 1,
          }),
        },
      });
    },
    get accordionDetailStyles(): Dictionary<string> {
      const styles = {
        ...useTarget({
          reactNative: {},
          default: {
            order:
              typeof state.openGridItemOrder === 'number'
                ? (state.openGridItemOrder as number)
                : undefined,
          },
        }),
        ...(props.grid && {
          width: '100%',
        }),
      };
      return Object.fromEntries(
        Object.entries(styles).filter(([_, value]) => value !== undefined)
      ) as Dictionary<string>;
    },
    onClick(index: number) {
      if (state.open.includes(index)) {
        state.open = state.onlyOneAtATime
          ? []
          : state.open.filter((item) => item !== index);
      } else {
        state.open = state.onlyOneAtATime ? [index] : state.open.concat(index);
      }
    },
  });

  const divRef = useRef<any>();

  return (
    <div ref={divRef} class="builder-accordion" style={state.accordionStyles}>
      <For each={props.items}>
        {(item, index) => (
          <>
            <div
              class={state.getAccordionTitleClassName(index)}
              style={{
                ...state.accordionTitleStyles,
                ...state.gridStyles(index),
              }}
              data-index={index}
              onClick={() => state.onClick(index)}
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
                class={state.getAccordionDetailClassName(index)}
                style={state.accordionDetailStyles}
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
