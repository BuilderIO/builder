export const defaultContent = {
  '@type': '@builder.io/sdk:Element',
  component: {
    name: 'Text',
    options: {
      text: '<p>Enter some text...</p>',
    },
    defaultStyle: {
      lineHeight: 'normal',
      height: 'auto',
      textAlign: 'center',
    },
  },
};

export const materialTableConfig = {
  name: 'Material Table',
  inputs: [
    {
      name: 'headColumns',
      type: 'list',
      subFields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          defaultValue: 'A column',
        },
        {
          name: 'numeric',
          type: 'boolean',
          defaultValue: false,
        },
      ],
      defaultValue: [
        {
          label: 'A column',
        },
      ],
    },
    {
      name: 'bodyRows',
      type: 'list',
      subFields: [
        {
          name: 'columns',
          type: 'list',
          subFields: [
            {
              name: 'content',
              type: 'uiBlocks',
              hideFromUI: true,
              defaultValue: [defaultContent],
            },
            {
              name: 'numeric',
              type: 'boolean',
              defaultValue: false,
            },
          ],
          defaultValue: [
            {
              content: [defaultContent],
            },
          ],
        },
      ],
      defaultValue: [
        {
          columns: [
            {
              content: [defaultContent],
            },
          ],
        },
      ],
    },
  ],
};
