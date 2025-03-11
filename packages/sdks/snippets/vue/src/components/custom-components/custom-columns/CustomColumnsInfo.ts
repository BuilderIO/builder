import CustomColumns from '@/components/custom-components/custom-columns/CustomColumns.vue';
import type { RegisteredComponent } from '@builder.io/sdk-vue';

export const CustomColumnsInfo: RegisteredComponent = {
  component: CustomColumns,
  name: 'MyColumns',
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
    {
      name: 'leftWidth',
      type: 'number',
      defaultValue: 1,
    },
    {
      name: 'rightWidth',
      type: 'number',
      defaultValue: 1,
    },
    {
      name: 'gap',
      type: 'number',
      defaultValue: 20,
    },
  ],

  shouldReceiveBuilderProps: {
    builderBlock: true,
    builderComponents: true,
    builderContext: true,
  },
};

export default CustomColumnsInfo;
