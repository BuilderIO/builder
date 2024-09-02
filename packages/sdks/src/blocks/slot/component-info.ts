import type { ComponentInfo } from '../../types/components.js';

export const componentInfo: ComponentInfo = {
  name: 'Slot',
  isRSC: true,
  description:
    'Allow child blocks to be inserted into this content when used as a Symbol',
  docsLink: 'https://www.builder.io/c/docs/symbols-with-blocks',
  image:
    'https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F3aad6de36eae43b59b52c85190fdef56',

  // Maybe wrap this for canHaveChildren so bind children to this hm
  inputs: [
    { name: 'name', type: 'string', required: true, defaultValue: 'children' },
  ],

  shouldReceiveBuilderProps: {
    builderContext: true,
    builderComponents: true,
  },
};
