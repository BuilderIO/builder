/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useContext } from 'react';
import { Builder } from '@builder.io/sdk';
import { BuilderBlocks } from '../components/builder-blocks.component';
import { BuilderStoreContext } from '../store/builder-store';

Builder.registerComponent(Slot, {
  name: 'Slot',

  // Maybe wrap this for canHaveChildren so bind children to this hm
  inputs: [{ name: 'name', type: 'string', required: true, defaultValue: 'children' }],
});

type DropzoneProps = {
  name: string;
};

export function Slot(props: DropzoneProps) {
  const { name } = props;
  const context = useContext(BuilderStoreContext);

  return (
    <div css={{ pointerEvents: 'auto' }}>
      <BuilderBlocks
        child
        parentElementId={context.context.symbolId}
        dataPath={`symbol.data.${name}`}
        blocks={context.state[name] || []}
      />
    </div>
  );
}
