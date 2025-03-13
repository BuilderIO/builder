import {
  Blocks,
  type BuilderBlock,
  type RegisteredComponent,
} from '@builder.io/sdk-react';

interface CustomColumnsProps {
  column1: BuilderBlock[];
  column2: BuilderBlock[];
  builderBlock: BuilderBlock;
}

export function CustomColumns({
  column1,
  column2,
  builderBlock,
}: CustomColumnsProps) {
  return (
    <>
      <Blocks blocks={column1} path="column1" parent={builderBlock.id} />
      <Blocks blocks={column2} path="column2" parent={builderBlock.id} />
    </>
  );
}

export const customColumnsInfo: RegisteredComponent = {
  name: 'MyColumns',
  component: CustomColumns,
  shouldReceiveBuilderProps: {
    builderBlock: true,
  },
  inputs: [
    {name: 'column1', type: 'uiBlocks', defaultValue: []},
    {name: 'column2', type: 'uiBlocks', defaultValue: []},
  ],
};
