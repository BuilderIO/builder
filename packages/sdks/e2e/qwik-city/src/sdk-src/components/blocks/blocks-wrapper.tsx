import { isEditing } from '../../functions/is-editing';

import { BuilderBlock } from '../../types/builder-block';

import { PropsWithChildren } from '../../types/typescript';

import {
  Fragment,
  Slot,
  component$,
  h,
  useComputed$,
  useStylesScoped$,
} from '@builder.io/qwik';

export type BlocksWrapperProps = {
  blocks: BuilderBlock[] | undefined;
  parent: string | undefined;
  path: string | undefined;
  styleProp: Record<string, any> | undefined;
};
export const onClick = function onClick(props, state) {
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
};
export const onMouseEnter = function onMouseEnter(props, state) {
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
};
export const BlocksWrapper = component$(
  (props: PropsWithChildren<BlocksWrapperProps>) => {
    useStylesScoped$(STYLES);

    const className = useComputed$(() => {
      return 'builder-blocks' + (!props.blocks?.length ? ' no-blocks' : '');
    });
    const state: any = {};

    return (
      <div
        class={className.value + ' div-BlocksWrapper'}
        builder-path={props.path}
        builder-parent-id={props.parent}
        {...{}}
        style={props.styleProp}
        onClick$={(event) => onClick(props, state)}
        onMouseEnter$={(event) => onMouseEnter(props, state)}
        onKeyPress$={(event) => onClick(props, state)}
      >
        <Slot></Slot>
      </div>
    );
  }
);

export default BlocksWrapper;

export const STYLES = `
.div-BlocksWrapper {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
`;
