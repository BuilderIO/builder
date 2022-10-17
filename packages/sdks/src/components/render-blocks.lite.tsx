import BuilderContext from '../context/builder.context.lite';
import { isEditing } from '../functions/is-editing.js';
import type { BuilderBlock } from '../types/builder-block.js';
import BlockStyles from './render-block/block-styles.lite';
import RenderBlock from './render-block/render-block.lite';
import { For, Show, useStore, useContext } from '@builder.io/mitosis';

export type RenderBlockProps = {
  blocks?: BuilderBlock[];
  parent?: string;
  path?: string;
  styleProp?: Record<string, any>;
};

export default function RenderBlocks(props: RenderBlockProps) {
  const builderContext = useContext(BuilderContext);

  const state = useStore({
    get className() {
      return 'builder-blocks' + (!props.blocks?.length ? ' no-blocks' : '');
    },
    onClick() {
      if (isEditing() && !props.blocks?.length) {
        window.parent?.postMessage(
          {
            type: 'builder.clickEmptyBlocks',
            data: {
              parentElementId: props.parent,
              dataPath: props.path,
            },
          },
          '*'
        );
      }
    },
    onMouseEnter() {
      if (isEditing() && !props.blocks?.length) {
        window.parent?.postMessage(
          {
            type: 'builder.hoverEmptyBlocks',
            data: {
              parentElementId: props.parent,
              dataPath: props.path,
            },
          },
          '*'
        );
      }
    },
  });

  return (
    <div
      class={state.className}
      builder-path={props.path}
      builder-parent-id={props.parent}
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      dataSet={{
        class: state.className,
      }}
      style={props.styleProp}
      css={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
      }}
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onClick={(event) => state.onClick()}
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onMouseEnter={(event) => state.onMouseEnter()}
    >
      {/**
       * We need to run two separate loops for content + styles to workaround the fact that Vue 2
       * does not support multiple root elements.
       */}
      <Show when={props.blocks}>
        <For each={props.blocks}>
          {(block) => (
            <RenderBlock
              key={'render-block-' + block.id}
              block={block}
              context={builderContext}
            />
          )}
        </For>
      </Show>
      <Show when={props.blocks}>
        <For each={props.blocks}>
          {(block) => (
            <BlockStyles
              key={'block-style-' + block.id}
              block={block}
              context={builderContext}
            />
          )}
        </For>
      </Show>
    </div>
  );
}
