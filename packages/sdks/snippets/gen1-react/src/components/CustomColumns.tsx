import { BuilderBlocks, type BuilderElement } from '@builder.io/react';
import React from 'react';

type BuilderProps = {
  column1: { blocks: React.ReactNode };
  column2: { blocks: React.ReactNode };
  builderBlock: BuilderElement;
};

const CustomColumns = (props: BuilderProps) => {
  return (
    <>
      <BuilderBlocks
        dataPath={`column1.blocks`}
        blocks={props.column1?.blocks}
        parentElementId={props.builderBlock.id}
      />
      <BuilderBlocks
        dataPath={`column2.blocks`}
        blocks={props.column2?.blocks}
        parentElementId={props.builderBlock.id}
      />
    </>
  );
};

export default CustomColumns;
