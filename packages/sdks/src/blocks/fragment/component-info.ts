import type { ComponentInfo } from '../../types/components.js';

export const componentInfo: ComponentInfo = {
  shouldReceiveBuilderProps: {
    builderBlock: false,
    builderContext: false,
    registeredComponents: false,
    linkComponent: false,
  },
  name: 'Fragment',
  static: true,
  hidden: true,

  canHaveChildren: true,
  noWrap: true,
};
