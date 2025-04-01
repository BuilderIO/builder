// app/components/CustomColumns.tsx
'use client';

import {
  Blocks,
  type BuilderBlock,
  type RegisteredComponent,
  type RegisteredComponents,
} from '@builder.io/sdk-react';

type CustomColumnsProps = {
  column1: BuilderBlock[];
  column2: BuilderBlock[];
  builderBlock: BuilderBlock;
  builderComponents: RegisteredComponents;
};

export function CustomColumns({
  column1,
  column2,
  builderBlock,
  builderComponents,
}: CustomColumnsProps) {
  return (
    <>
      <Blocks
        blocks={column1}
        path="column1"
        parent={builderBlock.id}
        registeredComponents={builderComponents} // Required: Helps pass registered components to <Blocks/> component
      />
      <Blocks
        blocks={column2}
        path="column2"
        parent={builderBlock.id}
        registeredComponents={builderComponents} // Required: Helps pass registered components to <Blocks/> component
      />
    </>
  );
}

export const customColumnsInfo: RegisteredComponent = {
  name: 'MyColumns',
  component: CustomColumns,
  shouldReceiveBuilderProps: {
    builderBlock: true,
    builderComponents: true, // Required: Helps pass registered components to <Blocks/> component
  },
  inputs: [
    { name: 'column1', type: 'uiBlocks', defaultValue: [] },
    { name: 'column2', type: 'uiBlocks', defaultValue: [] },
  ],
};
