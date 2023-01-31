import type { ComponentInfo } from '../../types/components';

export const componentInfo: ComponentInfo = {
  name: 'Core:Section',
  static: true,

  image:
    'https://cdn.builder.io/api/v1/image/assets%2FIsxPKMo2gPRRKeakUztj1D6uqed2%2F682efef23ace49afac61748dd305c70a',
  inputs: [
    {
      name: 'maxWidth',
      type: 'number',
      defaultValue: 1200,
    },
    {
      name: 'lazyLoad',
      type: 'boolean',
      defaultValue: false,
      advanced: true,
      description: 'Only render this section when in view',
    },
  ],
  defaultStyles: {
    paddingLeft: '20px',
    paddingRight: '20px',
    paddingTop: '50px',
    paddingBottom: '50px',
    marginTop: '0px',
    width: '100vw',
    marginLeft: 'calc(50% - 50vw)',
  },
  canHaveChildren: true,

  defaultChildren: [
    {
      '@type': '@builder.io/sdk:Element',
      responsiveStyles: {
        large: {
          textAlign: 'center',
        },
      },
      component: {
        name: 'Text',
        options: {
          text: "<p><b>I am a section! My content keeps from getting too wide, so that it's easy to read even on big screens.</b></p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur</p>",
        },
      },
    },
  ],
};
