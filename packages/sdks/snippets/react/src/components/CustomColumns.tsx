import {
  Blocks,
  BuilderBlock,
  RegisteredComponent,
} from '@builder.io/sdk-react';

interface CustomColumnsProps {
  columns: { blocks: BuilderBlock[] | undefined }[];
  builderBlock: BuilderBlock;
}

const CustomColumns = (props: CustomColumnsProps) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        border: '10px solid #ccc',
        padding: '10px',
      }}
    >
      <Blocks
        blocks={props.columns[0]?.blocks}
        path={`component.options.columns.0.blocks`}
        parent={props.builderBlock.id}
      />

      <Blocks
        blocks={props.columns[1]?.blocks}
        path={`component.options.columns.1.blocks`}
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
  },
  inputs: [
    {
      name: 'columns',
      type: 'array',
      broadcast: true,
      hideFromUI: true,
      defaultValue: [
        {
          blocks: [],
        },
        {
          blocks: [],
        },
      ],
    },
  ],
};
