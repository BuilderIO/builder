import { Show, useStore, useContext, For } from '@builder.io/mitosis';
import type { BuilderElement } from '../../types/element';
import RenderBlocks from '../../components/render-blocks.lite';
import RenderBlock from '../../components/render-block/render-block.lite';
import BuilderContext from '../../context/builder.context.lite';

export interface AccordionItem {
  state: any;
  titleBlocks: BuilderElement[];
  detailBlocks: BuilderElement[];
  index: number;
  openGridItemOrder: number | null;
  onlyOneAtATime: boolean;
  fromChildren: boolean;
}

export default function AccordionItem(props: any) {
  const state = useStore({
    isOpen: props.state.open.indexOf(props.index) !== -1,
  });
  const context = useContext(BuilderContext);
  return (
    <div key={props.index}>
      <div
        className={`builder-accordion-title builder-accordion-title-${
          state.isOpen ? 'open' : 'closed'
        }`}
        css={{
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          // ...(props.grid && {
          //     width: props.gridRowWidth,
          //     ...(typeof props.openGridItemOrder === 'number' && {
          //         order:
          //             props.index < props.openGridItemOrder
          //                 ? props.index
          //                 : props.index + 1,
          //     }),
          // }),
        }}
        data-index={props.index}
        onClick={() => {
          if (state.isOpen) {
            props.state.open = props.onlyOneAtATime
              ? []
              : props.state.open.filter((item: any) => item !== props.index);
          } else {
            props.state.open = props.onlyOneAtATime
              ? [props.index]
              : props.state.open.concat(props.index);
          }
        }}
      >
        {props.fromChildren ? (
          <For each={props.titleBlocks}>
            {(block: any, index) => (
              <RenderBlock
                key={index}
                block={{
                  ...block,
                  repeat: null,
                }}
                context={context}
              />
            )}
          </For>
        ) : (
          <RenderBlocks
            blocks={props.titleBlocks}
            path={`items.${props.index}.title`}
          />
        )}
      </div>
      <Show when={state.isOpen}>
        <div
          className={`builder-accordion-detail builder-accordion-detail-${
            state.isOpen ? 'open' : 'closed'
          }`}
          // css={{
          //     order:
          //         typeof props.openGridItemOrder === 'number'
          //             ? props.openGridItemOrder
          //             : undefined,
          //     ...(props.grid && {
          //         width: '100%',
          //     }),
          // }}
        >
          {props.fromChildren ? (
            <For each={props.detailBlocks}>
              {(block: any, index) => (
                <RenderBlock
                  key={index}
                  block={{
                    ...block,
                    repeat: null,
                  }}
                  context={context}
                />
              )}
            </For>
          ) : (
            <RenderBlocks
              blocks={props.detailBlocks}
              path={`items.${props.index}.detail`}
            />
          )}
        </div>
      </Show>
    </div>
  );
}
