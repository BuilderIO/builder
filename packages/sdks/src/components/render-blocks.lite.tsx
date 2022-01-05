import { Show, useState } from '@builder.io/mitosis';
import { isEditing } from '../functions/is-editing';
import { BuilderBlock } from '../types/builder-block';
import RenderBlock from './render-block.lite';

export type RenderBlockProps = {
  blocks?: BuilderBlock[];
  parent?: string;
  path: string;
};

export default function RenderBlocks(props: RenderBlockProps) {
  const state = useState({
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
      className={'builder-blocks' + (!props.blocks?.length ? ' no-blocks' : '')}
      builder-path={props.path}
      builder-parent-id={props.parent}
      css={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
      }}
      onClick={state.onClick}
      onMouseEnter={state.onMouseEnter}
    >
      <Show when={props.blocks}>
        {props.blocks?.map((block: any) => (
          <RenderBlock block={block} />
        ))}
      </Show>
    </div>
  );
}
