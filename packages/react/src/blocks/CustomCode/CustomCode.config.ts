import { Builder } from '@builder.io/sdk';

const isShopify = Builder.isBrowser && 'Shopify' in window;

export const CUSTOM_CODE_SCHEMA =  {
  name: 'Custom Code',
  static: true,
  requiredPermissions: ['editCode' as const],
  inputs: [
    {
      name: 'code',
      type: 'html',
      required: true,
      defaultValue: '<p>Hello there, I am custom HTML code!</p>',
      code: true,
    },
    {
      name: 'replaceNodes',
      type: 'boolean',
      helperText: 'Preserve server rendered dom nodes',
      advanced: true,
      ...(isShopify && {
        defaultValue: true,
      }),
    },
    {
      name: 'scriptsClientOnly',
      type: 'boolean',
      helperText:
        'Only print and run scripts on the client. Important when scripts influence DOM that could be replaced when client loads',
      advanced: true,
      ...(!isShopify && {
        defaultValue: true,
      }),
    },
  ],
};
