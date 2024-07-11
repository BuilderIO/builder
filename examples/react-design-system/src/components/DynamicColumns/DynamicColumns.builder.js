import { Builder } from '@builder.io/react';
import { DynamicColumns } from './DynamicColumns';

Builder.registerComponent(DynamicColumns, {
  name: 'Dynamic Columns',
  image:
    'https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fd8ed37ba1bc143c0bb76008caff4b0da',
  inputs: [
    {
      name: 'columns',
      type: 'array',
      defaultValue: [
        {
          image:
            'https://cdn.builder.io/api/v1/image/assets%2Fpwgjf0RoYWbdnJSbpBAjXNRMe9F2%2Ffb27a7c790324294af8be1c35fe30f4d',
          text: 'Hello',
        },
        {
          image:
            'https://cdn.builder.io/api/v1/image/assets%2Fpwgjf0RoYWbdnJSbpBAjXNRMe9F2%2Ffb27a7c790324294af8be1c35fe30f4d',
          text: 'Hello',
        },
      ],
      subFields: [
        {
          name: 'image',
          type: 'file',
          allowedFileTypes: ['jpeg', 'jpg', 'png', 'svg', 'webp'],
          required: true,
          defaultValue:
            'https://cdn.builder.io/api/v1/image/assets%2Fpwgjf0RoYWbdnJSbpBAjXNRMe9F2%2Ffb27a7c790324294af8be1c35fe30f4d',
        },
        {
          name: 'text',
          type: 'string',
          defaultValue: 'Your Title Here',
        },
      ],
    },
  ],
});
