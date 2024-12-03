import { BuilderBlocks, BuilderElement } from '@builder.io/react';

interface CustomColumnsProps {
  column1: React.ReactNode;
  column2: React.ReactNode;
  builderBlock: BuilderElement;
}

export const CustomColumns = (props: CustomColumnsProps) => {
  console.log('props', props);
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
