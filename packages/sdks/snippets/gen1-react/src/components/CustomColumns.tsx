import { BuilderBlocks, type BuilderElement } from '@builder.io/react';

type BuilderProps = {
  column1: React.ReactNode;
  column2: React.ReactNode;
  builderBlock: BuilderElement;
};

const CustomColumns = (props: BuilderProps) => {
  return (
    <>
      <BuilderBlocks
        parentElementId={props.builderBlock.id}
        dataPath="column1"
        blocks={props.column1}
      />
      <BuilderBlocks
        parentElementId={props.builderBlock.id}
        dataPath="column2"
        blocks={props.column2}
      />
    </>
  );
};

export default CustomColumns;
