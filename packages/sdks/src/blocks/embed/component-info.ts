import type { ComponentInfo } from '../../types/components.js';

// Provided by the web app as a local variable in onChange functions
declare const _iframelyApiKey: string;

export const componentInfo: ComponentInfo = {
  shouldReceiveBuilderProps: {
    builderBlock: false,
    builderContext: false,
    builderComponents: false,
    builderLinkComponent: false,
  },
  name: 'Embed',
  static: true,

  inputs: [
    {
      name: 'url',
      type: 'url',
      required: true,
      defaultValue: '',
      helperText: 'e.g. enter a youtube url, google map, etc',
    },
    {
      name: 'content',
      type: 'html',
      defaultValue:
        '<div style="padding: 20px; text-align: center">(Choose an embed URL)<div>',
      hideFromUI: true,
    },
  ],
};
