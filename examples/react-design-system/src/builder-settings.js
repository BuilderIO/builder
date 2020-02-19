import { Builder } from '@builder.io/react';

// Remove this to allow all components to be used
const OVERRIDE_INSERT_MENU = true;

if (OVERRIDE_INSERT_MENU) {
  Builder.set({ customInsertMenu: true });

  Builder.register('insertMenu', {
    name: 'Simple components',
    items: [
      { name: 'Hero' },
      { name: 'Triple Columns' },
      { name: 'Double Columns' },
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
}
