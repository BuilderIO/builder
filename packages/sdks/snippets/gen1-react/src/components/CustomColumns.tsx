import { BuilderBlocks, type BuilderElement } from '@builder.io/react';

type BuilderProps = {
  column1: { blocks: any[] };
  column2: { blocks: any[] };
  builderBlock: BuilderElement;
};

const CustomColumns = (props: BuilderProps) => {
  return (
    <>
      <BuilderBlocks
        parentElementId={props.builderBlock.id}
        dataPath="column1.blocks"
        blocks={props.column1?.blocks}
      />
      <BuilderBlocks
        parentElementId={props.builderBlock.id}
        dataPath="column2.blocks"
        blocks={props.column2?.blocks}
      />
    </>
  );
};

export default CustomColumns;
