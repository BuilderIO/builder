import {
  Blocks,
  BuilderBlock,
  RegisteredComponent,
} from '@builder.io/sdk-react';

interface CustomColumnsProps {
  column1: BuilderBlock[];
  column2: BuilderBlock[];
  builderBlock: BuilderBlock;
}

const CustomColumns = (props: CustomColumnsProps) => {
  return (
    <>
      <Blocks
        blocks={props.column1}
        path="column1"
        parent={props.builderBlock.id}
      />

      <Blocks
        blocks={props.column2}
        path="column2"
        parent={props.builderBlock.id}
      />
    </>
  );
};

export const customColumnsInfo: RegisteredComponent = {
  name: 'MyColumns',
  component: CustomColumns,
  shouldReceiveBuilderProps: {
    builderBlock: true,
  },
  inputs: [
    {
      name: 'column1',
      type: 'uiBlocks',
      defaultValue: [],
    },
    {
      name: 'column2',
      type: 'uiBlocks',
      defaultValue: [],
    },
  ],
};
