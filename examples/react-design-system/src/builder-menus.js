export const menus = [
  {
    name: 'Simple components',
    items: [
      { name: 'Hero' },
      { name: 'Double Columns' },
      { name: 'Triple Columns' },
      { name: 'Dynamic Columns' },
    ],
  },
  {
    name: 'Dynamic components',
    items: [
      { name: 'Hero With Children' },
      { name: 'Products List' },
      { name: 'Reviews Slider' },
      { name: 'Products List SSR' },

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
  },
  {
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
  },
];
