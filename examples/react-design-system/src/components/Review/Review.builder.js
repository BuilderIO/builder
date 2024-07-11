import { Builder } from '@builder.io/react';
import { Review } from './Review';
export const ReviewBuilderConfig = {
  name: 'Review',
  inputs: [
    {
      name: 'backgroundColor',
      type: 'color',
      defaultValue: '#fafafafa',
    },

    {
      name: 'reviewText',
      type: 'string',
      defaultValue: '"You guys are the best"',
    },
    {
      name: 'reviewAuthor',
      type: 'string',
      defaultValue: 'Jane Smith',
    },
    {
      name: 'image',
      type: 'file',
      allowedFileTypes: ['jpeg', 'jpg', 'png', 'svg', 'webp'],
      required: true,
      defaultValue:
        'https://cdn.builder.io/api/v1/image/assets%2Fpwgjf0RoYWbdnJSbpBAjXNRMe9F2%2Ffb27a7c790324294af8be1c35fe30f4d',
    },
  ],
};

Builder.registerComponent(Review, ReviewBuilderConfig);
