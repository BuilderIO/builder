import { ComponentInfo } from '../../functions/register-component';

export const componentInfo: ComponentInfo = {
  name: 'Builder:RawText',
  hideFromInsertMenu: true,
  builtIn: true,
  inputs: [
    {
      name: 'text',
      bubble: true,
      type: 'longText',
      required: true,
    },
  ],
};
