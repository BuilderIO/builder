import { Builder } from '@builder.io/react';
import { CustomColumns } from './CustomColumns';

Builder.registerComponent(CustomColumns, {
  name: 'Custom Columns',
  description: 'Example of a custom column with editing regions',
  inputs: [
    {
      name: 'columns',
      type: 'array',
      defaultValue: [
        {
          image:
            'https://cdn.builder.io/api/v1/image/assets%2Fpwgjf0RoYWbdnJSbpBAjXNRMe9F2%2Ffb27a7c790324294af8be1c35fe30f4d',
          blocks: [],
        },
        {
          image:
            'https://cdn.builder.io/api/v1/image/assets%2Fpwgjf0RoYWbdnJSbpBAjXNRMe9F2%2Ffb27a7c790324294af8be1c35fe30f4d',
          blocks: [],
        },
      ],
      subFields: [
        {
          name: 'image',
          type: 'file',
          allowedFileTypes: ['jpeg', 'jpg', 'png', 'svg'],
          required: true,
          defaultValue:
            'https://cdn.builder.io/api/v1/image/assets%2Fpwgjf0RoYWbdnJSbpBAjXNRMe9F2%2Ffb27a7c790324294af8be1c35fe30f4d',
        },
      ],
    },
  ],
});
