import { BuilderBlocks, BuilderElement } from '@builder.io/react';

interface CustomColumnsProps {
  column1: { blocks: unknown[] | React.ReactNode };
  column2: { blocks: unknown[] | React.ReactNode };
  builderBlock: BuilderElement;
}

export const CustomColumns = (props: CustomColumnsProps) => {
  return (
    <>
      <BuilderBlocks
        parentElementId={props.builderBlock.id}
        dataPath={`column1.blocks`}
        blocks={props.column1?.blocks}
      />

      <BuilderBlocks
        parentElementId={props.builderBlock.id}
        dataPath={`column2.blocks`}
        blocks={props.column2?.blocks}
      />
    </>
  );
};
