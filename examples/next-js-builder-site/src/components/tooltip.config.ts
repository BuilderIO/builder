export const tooltipConfig = {
  name: 'Tooltip',
  inputs: [
    {
      name: 'text',
      type: 'longText',
      defaultValue: 'Hello there',
      required: true,
    },
    {
      name: 'placement',
      type: 'text',
      defaultValue: 'top',
    },
  ],
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
          text: 'Hover me!',
        },
      },
    },
  ],
  canHaveChildren: true,
};
