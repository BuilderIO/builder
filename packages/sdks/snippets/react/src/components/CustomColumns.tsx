import {
  Blocks,
  BuilderBlock,
  RegisteredComponent,
} from '@builder.io/sdk-react';
import {
  BuilderContextInterface,
  RegisteredComponents,
} from '../../../../output/react/types/context/types';

interface CustomColumnsProps {
  column1: { blocks: BuilderBlock[] | undefined };
  column2: { blocks: BuilderBlock[] | undefined };
  builderBlock: BuilderBlock;
  builderComponents: RegisteredComponents;
  builderContext: BuilderContextInterface;
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
        blocks={props.column1.blocks}
        path={`component.options.column1.blocks`}
        parent={props.builderBlock.id}
        context={props.builderContext}
        registeredComponents={props.builderComponents}
      />

      <Blocks
        blocks={props.column2.blocks}
        path={`component.options.column2.blocks`}
        parent={props.builderBlock.id}
        context={props.builderContext}
        registeredComponents={props.builderComponents}
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
