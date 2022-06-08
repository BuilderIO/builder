import { isEditing } from '../functions/is-editing.js';
import { BuilderBlock } from '../types/builder-block.js';
import BlockStyles from './render-block/block-styles.lite';
import RenderBlock from './render-block/render-block.lite';
import { For, Show, useState } from '@builder.io/mitosis';

export type RenderBlockProps = {
  blocks?: BuilderBlock[];
  parent?: string;
  path?: string;
};

export default function RenderBlocks(props: RenderBlockProps) {
  const state = useState({
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
      className={state.className}
      builder-path={props.path}
      builder-parent-id={props.parent}
      dataSet={{
        class: state.className,
      }}
      css={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
      }}
      onClick={(event) => state.onClick()}
      onMouseEnter={(event) => state.onMouseEnter()}
    >
      <Show when={props.blocks}>
        <For each={props.blocks}>
          {(block) => (
            <RenderBlock key={'render-block-' + block.id} block={block} />
          )}
        </For>
      </Show>
      <Show when={props.blocks}>
        <For each={props.blocks}>
          {(block) => (
            <BlockStyles key={'block-style-' + block.id} block={block} />
          )}
        </For>
      </Show>
    </div>
  );
}
