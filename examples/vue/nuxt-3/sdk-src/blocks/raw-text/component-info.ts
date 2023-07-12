import type { ComponentInfo } from '../../types/components';

export const componentInfo: ComponentInfo = {
  name: 'Builder:RawText',
  hideFromInsertMenu: true,

  inputs: [
    {
      name: 'text',
      bubble: true,
      type: 'longText',
      required: true,
    },
  ],
};
