import { useStore, useTarget } from '@builder.io/mitosis';
import { isEditing } from '../../functions/is-editing.js';
import type { BuilderBlock } from '../../types/builder-block.js';
import type { PropsWithChildren } from '../../types/typescript.js';
import { useMetadata } from '@builder.io/mitosis';

useMetadata({
  rsc: {
    componentType: 'client',
  },
});

export type BlocksWrapperProps = {
  blocks: BuilderBlock[] | undefined;
  parent: string | undefined;
  path: string | undefined;
  styleProp: Record<string, any> | undefined;
};

export default function BlocksWrapper(
  props: PropsWithChildren<BlocksWrapperProps>
) {
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
      {...useTarget({
        reactNative: { dataSet: { class: state.className } },
        default: {},
      })}
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onKeyPress={(event) => state.onClick()}
    >
      {props.children}
    </div>
  );
}
