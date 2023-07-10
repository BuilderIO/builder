'use client';
import * as React from 'react';
export type RenderBlockProps = {
  blocks?: BuilderBlock[];
  parent?: string;
  path?: string;
  styleProp?: Record<string, any>;
};
import { isEditing } from '../../functions/is-editing';
import type { BuilderBlock } from '../../types/builder-block';

function RenderBlocksWrapper(props: React.PropsWithChildren<RenderBlockProps>) {
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
        className={className() + ' div-6dd9939e'}
        builder-path={props.path}
        builder-parent-id={props.parent}
        style={props.styleProp}
        onClick={(event) => onClick()}
        onMouseEnter={(event) => onMouseEnter()}
        onKeyPress={(event) => onClick()}
      >
        {props.children}
      </div>

      <style>{`.div-6dd9939e {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}`}</style>
    </>
  );
}

export default RenderBlocksWrapper;
