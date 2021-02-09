const defaultElement = {
  '@type': '@builder.io/sdk:Element',
  responsiveStyles: {
    large: {
      height: '200px',
    },
  },
};

export const materialTabsConfig = {
  name: 'Material Tabs',
  inputs: [
    {
      name: 'tabs',
      type: 'list',
      subFields: [
        { name: 'label', type: 'text', required: true, defaultValue: 'A tab' },
        {
          name: 'content',
          type: 'uiBlocks',
          hideFromUI: true,
          defaultValue: [defaultElement],
        },
      ],
      defaultValue: [
        {
          label: 'A tab',
          content: [defaultElement],
        },
      ],
    },
    {
      name: 'centered',
      type: 'boolean',
      defaultValue: false,
    },
    {
      name: 'fullWidth',
      type: 'boolean',
      defaultValue: false,
    },
    {
      name: 'scrollable',
      type: 'boolean',
      defaultValue: true,
    },
    {
      name: 'includeDivider',
      type: 'boolean',
      defaultValue: false,
    },
    {
      name: 'useDisplay',
      type: 'boolean',
      defaultValue: false,
    },
    {
      name: 'autoRotateTabsInterval',
      type: 'number',
      defaultValue: 0,
      helperText: 'Auto rotate tabs interval (in seconds)',
    },
  ],
};
