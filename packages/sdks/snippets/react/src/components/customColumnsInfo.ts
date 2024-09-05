import { RegisteredComponent } from '@builder.io/sdk-react';
import CustomColumns from './CustomColumns';

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
