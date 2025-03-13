import { component$ } from '@builder.io/qwik';
import {
  Blocks,
  type BuilderBlock,
  type RegisteredComponent,
} from '@builder.io/sdk-qwik';

export const CustomColumns = component$(
  (props: {
    column1: BuilderBlock[];
    column2: BuilderBlock[];
    builderBlock: BuilderBlock;
  }) => {
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
  }
);

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
