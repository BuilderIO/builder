'use client';
import * as React from 'react';
import { isEditing } from '../../functions/is-editing';
import type { BuilderBlock } from '../../types/builder-block';
import type { PropsWithChildren } from '../../types/typescript';

export type BlocksWrapperProps = {
  blocks: BuilderBlock[] | undefined;
  parent: string | undefined;
  path: string | undefined;
  styleProp: Record<string, any> | undefined;
};

function BlocksWrapper(props: PropsWithChildren<BlocksWrapperProps>) {
  function className() {
    return 'builder-blocks' + (!props.blocks?.length ? ' no-blocks' : '');
  }

  function onClick() {
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
  }

  function onMouseEnter() {
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
  }

  return (
    <>
      <div
        className={className() + ' div-02c7a115'}
        builder-path={props.path}
        builder-parent-id={props.parent}
        {...{}}
        style={props.styleProp}
        onClick={(event) => onClick()}
        onMouseEnter={(event) => onMouseEnter()}
        onKeyPress={(event) => onClick()}
      >
        {props.children}
      </div>

      <style>{`.div-02c7a115 {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}`}</style>
    </>
  );
}

export default BlocksWrapper;
