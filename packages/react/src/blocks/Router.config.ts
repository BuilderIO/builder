export const RouterConfig = {
  name: 'Core:Router',
  hideFromInsertMenu: true,
  // TODO: advanced: true
  inputs: [
    {
      // TODO: search picker
      name: 'model',
      type: 'string',
      defaultValue: 'page',
      advanced: true,
    },
    {
      name: 'handleRouting',
      type: 'boolean',
      defaultValue: true,
      advanced: true,
    },
    {
      name: 'preloadOnHover',
      type: 'boolean',
      defaultValue: true,
      advanced: true,
    },
    {
      name: 'onRoute',
      type: 'function',
      advanced: true,
      // Subfields are function arguments - object with properties
    },
  ],
};
