import type { ComponentInfo } from '../../types/components.js';

export const componentInfo: ComponentInfo = {
  name: 'PersonalizationContainer',
  noWrap: true,
  image:
    'https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F37229ed30d8c41dfb10b8cca1992053a',
  canHaveChildren: true,
  inputs: [
    {
      name: 'variants',
      defaultValue: [],
      behavior: 'personalizationVariantList',
      type: 'list',
      subFields: [
        {
          name: 'name',
          type: 'text',
        },
        {
          name: 'query',
          friendlyName: 'Targeting rules',
          type: 'BuilderQuery',
          defaultValue: [],
        },
        {
          name: 'startDate',
          type: 'date',
        },
        {
          name: 'endDate',
          type: 'date',
        },
        {
          name: 'blocks',
          type: 'uiBlocks',
          hideFromUI: true,
          defaultValue: [],
        },
      ],
    },
  ],
};
