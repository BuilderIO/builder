import {
  Blocks,
  BuilderBlock,
  RegisteredComponent,
} from '@builder.io/sdk-react';

interface CustomColumnsProps {
  column1: { blocks: BuilderBlock[] | undefined };
  column2: { blocks: BuilderBlock[] | undefined };
  builderBlock: BuilderBlock;
}

const CustomColumns = (props: CustomColumnsProps) => {
  return (
    <div>
      <Blocks
        blocks={props.column1?.blocks}
        path={`column1.blocks`}
        parent={props.builderBlock.id}
      />

      <Blocks
        blocks={props.column2?.blocks}
        path={`column2.blocks`}
        parent={props.builderBlock.id}
      />
    </div>
  );
};

export const customColumnsInfo: RegisteredComponent = {
  name: 'MyColumns',
  component: CustomColumns,
  shouldReceiveBuilderProps: {
    builderBlock: true,
    builderComponents: true,
    builderContext: true,
  },
  inputs: [
    {
      name: 'column1',
      type: 'uiBlocks',
      broadcast: true,
      hideFromUI: true,
      defaultValue: {
        blocks: [],
      },
    },
    {
      name: 'column2',
      type: 'uiBlocks',
      broadcast: true,
      hideFromUI: true,
      defaultValue: {
        blocks: [],
      },
    },
  ],
};
