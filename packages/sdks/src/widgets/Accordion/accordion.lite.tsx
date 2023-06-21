import type { BuilderElement } from '../../types/element';
import { useStore, Show, For } from '@builder.io/mitosis';
import AccordionItem from './accordion-item.lite';

interface AccordionProps {
  items: {
    title: BuilderElement[];
    detail: BuilderElement[];
  }[];
  oneAtATime?: boolean;
  grid?: boolean;
  defaultOpen?: any; // does not exist in accordion.config
  builderBlock?: BuilderElement; // does not exist in accordion.config
  // TODO: gridRowWidth
  gridRowWidth?: number;
  useChildrenForItems?: boolean;
}

export interface AccordionState {
  open: any;
  onlyOneAtATime: boolean;
  getOpenGridItemPosition: number | boolean | undefined;
  openGridItemOrder: number | null;
}

export default function Accordion(props: AccordionProps) {
  const state = useStore<AccordionState>({
    open: [],
    onlyOneAtATime: Boolean(props.grid || props.oneAtATime),
    getOpenGridItemPosition: props.grid && open.length,
    openGridItemOrder: null,
  });

  // if (state.getOpenGridItemPosition) {
  //     const openItemIndex = state.open[0]
  //     const openItem = document.querySelector(
  //         `.builder-accordion-title[data-index="${openItemIndex}"]`
  //     )

  //     let subjectItem = openItem
  //     state.openGridItemOrder = openItemIndex

  //     if (subjectItem) {
  //         let prevItemRect = subjectItem.getBoundingClientRect()

  //         while (
  //             (subjectItem = subjectItem && subjectItem.nextElementSibling)
  //         ) {
  //             if (subjectItem) {
  //                 if (
  //                     subjectItem.classList.contains(
  //                         'builder-accordion-detail'
  //                     )
  //                 ) {
  //                     continue
  //                 }
  //                 const subjectItemRect = subjectItem.getBoundingClientRect()
  //                 if (subjectItemRect.left > prevItemRect.left) {
  //                     const index = parseInt(
  //                         subjectItem.getAttribute('data-index') || '',
  //                         10
  //                     )
  //                     if (!isNaN(index)) {
  //                         prevItemRect = subjectItemRect
  //                         // @ts-ignore
  //                         state.openGridItemOrder = index
  //                     }
  //                 } else {
  //                     break
  //                 }
  //             }
  //         }
  //     }
  // }

  // if (typeof state.openGridItemOrder === 'number') {
  //     state.openGridItemOrder = state.openGridItemOrder + 1
  // }

  return (
    <div
      className="builder-accordion"
      css={{
        display: 'flex',
        alignItems: 'stretch',
        flexDirection: 'column',
        // ...(grid && {
        //     flexDirection: 'row',
        //     alignItems: 'flex-start',
        //     flexWrap: 'wrap',
        // }),
      }}
    >
      <Show
        when={
          props.useChildrenForItems &&
          props.builderBlock &&
          props.builderBlock.children
        }
      >
        <For each={props.builderBlock.children}>
          {(block: any, index) => (
            <AccordionItem
              state={state}
              titleBlocks={block.children ? block.children[0] : []}
              detailBlocks={block.children ? block.children[1] : []}
              index={index}
              openGridItemOrder={state.openGridItemOrder}
              onlyOneAtATime={state.onlyOneAtATime}
              fromChildren={true}
            />
          )}
        </For>
      </Show>
      <Show when={!props.useChildrenForItems && props.items}>
        <For each={props.items}>
          {(item, index) => (
            <AccordionItem
              state={state}
              titleBlocks={item.title}
              detailBlocks={item.detail}
              index={index}
              openGridItemOrder={state.openGridItemOrder}
              onlyOneAtATime={state.onlyOneAtATime}
            />
          )}
        </For>
      </Show>
    </div>
  );
}
