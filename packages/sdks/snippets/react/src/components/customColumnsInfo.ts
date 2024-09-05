import CustomColumns from './CustomColumns';

export const customColumnsInfo = {
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
