import { Builder } from '@builder.io/react';
import { DoubleColumns } from './DoubleColumns';

Builder.registerComponent(DoubleColumns, {
  name: 'Double Columns',
  inputs: [
    {
      name: 'sectionTitle',
      type: 'string',
      defaultValue: 'Your Title Here',
    },
    {
      name: 'text1',
      type: 'string',
      defaultValue: 'Your Title Here',
    },
    {
      name: 'image1',
      type: 'file',
      // TODO: auto coHnvert png to jpg when there is no transparency
      allowedFileTypes: ['jpeg', 'jpg', 'png', 'svg'],
      required: true,
      // TODO: something better
      defaultValue:
        'https://cdn.builder.io/api/v1/image/assets%2Fpwgjf0RoYWbdnJSbpBAjXNRMe9F2%2Ffb27a7c790324294af8be1c35fe30f4d',
    },
    {
      name: 'text2',
      type: 'string',
      defaultValue: 'Your Title Here',
    },
    {
      name: 'image2',
      type: 'file',
      // TODO: auto coHnvert png to jpg when there is no transparency
      allowedFileTypes: ['jpeg', 'jpg', 'png', 'svg'],
      required: true,
      // TODO: something better
      defaultValue:
        'https://cdn.builder.io/api/v1/image/assets%2Fpwgjf0RoYWbdnJSbpBAjXNRMe9F2%2Ffb27a7c790324294af8be1c35fe30f4d',
    },
  ],
});
