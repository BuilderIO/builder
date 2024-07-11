import type { ComponentInfo } from '../../types/components.js';

export const componentInfo: ComponentInfo = {
  shouldReceiveBuilderProps: {
    builderBlock: false,
    builderContext: false,
    registeredComponents: false,
    linkComponent: false,
  },
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
