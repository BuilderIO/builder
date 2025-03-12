import type { RegisteredComponent } from '@builder.io/sdk-vue';
import CustomColumns from './CustomColumns.vue';

export const CustomColumnsInfo: RegisteredComponent = {
  component: CustomColumns,
  name: 'MyColumns', // you can define your custom name for the component
  inputs: [
    {
      name: 'leftContent',
      type: 'uiBlocks',
      defaultValue: [],
    },
    {
      name: 'rightContent',
      type: 'uiBlocks',
      defaultValue: [],
    },
  ],

  shouldReceiveBuilderProps: {
    builderBlock: true,
  },
};

export default CustomColumnsInfo;
