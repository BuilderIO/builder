import { Builder } from '@builder.io/react';

// Remove this to allow all built-in components to be used too
const OVERRIDE_INSERT_MENU = true;

if (OVERRIDE_INSERT_MENU) {
  // (optionally) use this to hide all default built-in components and fully manage
  // the insert menu components and sections yourself
  Builder.set({ customInsertMenu: true });
}

// (optionally) set these to add your own sections of components arranged as you choose.
// this can be used with or without `customInsertMenu` above
Builder.register('insertMenu', {
  name: 'Simple components',
  items: [
    { name: 'Hero' },
    { name: 'Double Columns' },
    { name: 'Triple Columns' },
    { name: 'Dynamic Columns' },
  ],
});
Builder.register('insertMenu', {
  name: 'Dynamic components',
  items: [
    { name: 'Hero With Children' },
    { name: 'Products List' },
    { name: 'Reviews Slider' },

    // More advanced
    {
      name: 'Hero With Children Alt',
      item: {
        component: {
          name: 'Hero With Children',
          options: {
            image:
              'https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F349738e6805b481ab6c50bda7e24445e',
            height: 400,
          },
        },
        children: [
          // Supply alternate children
          {
            '@type': '@builder.io/sdk:Element',
            component: {
              name: 'Heading',
              options: {
                text: 'You can edit the contents of this example!',
                type: 'h4',
              },
            },
          },
        ],
      },
    },
  ],
});
Builder.register('insertMenu', {
  name: 'Blocks',
  items: [
    { name: 'Button' },
    { item: 'Heading', name: 'Heading 1' },

    // More advanced
    {
      name: 'Heading 2',
      // heading alt
      item: {
        '@type': '@builder.io/sdk:Element',
        component: {
          name: 'Heading',
          options: {
            text: 'I am an h2',
            type: 'h2',
          },
        },
      },
    },
    {
      name: 'Heading 3',
      // heading alt 2
      item: {
        '@type': '@builder.io/sdk:Element',
        component: {
          name: 'Heading',
          options: {
            text: 'I am am h3',
            type: 'h3',
          },
        },
      },
    },
  ],
});
