import type { RegisteredComponent } from '@builder.io/sdk-vue';
import CustomTabs from './CustomTabs.vue';

export const CustomTabsInfo: RegisteredComponent = {
  component: CustomTabs,
  name: 'TabFields',
  inputs: [
    {
      name: 'tabList',
      type: 'list',
      subFields: [
        {
          name: 'tabName',
          type: 'string',
        },
        {
          name: 'blocks',
          type: 'uiBlocks',
          defaultValue: [],
        },
      ],
    },
  ],
  shouldReceiveBuilderProps: {
    builderBlock: true,
  },
};

export default CustomTabsInfo;
