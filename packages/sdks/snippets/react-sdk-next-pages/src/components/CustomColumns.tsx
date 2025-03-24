// components/CustomColumns.tsx
'use client';
import type {
  BuilderBlock,
  RegisteredComponent,
  RegisteredComponents,
} from '@builder.io/sdk-react';
import { Blocks } from '@builder.io/sdk-react';

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
        registeredComponents={builderComponents}
      />
      <Blocks
        blocks={column2}
        path="column2"
        parent={builderBlock.id}
        registeredComponents={builderComponents}
      />
    </>
  );
}

export const customColumnsInfo: RegisteredComponent = {
  name: 'MyColumns',
  component: CustomColumns,
  shouldReceiveBuilderProps: { builderBlock: true, builderComponents: true },
  inputs: [
    { name: 'column1', type: 'uiBlocks', defaultValue: [] },
    { name: 'column2', type: 'uiBlocks', defaultValue: [] },
  ],
};
