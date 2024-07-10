import { Builder } from '@builder.io/react';
import { ReviewsSlider } from './ReviewsSlider';

export const ReviewsSliderBuilderConfig = {
  name: 'Reviews Slider',
  inputs: [
    {
      name: 'dots',
      type: 'boolean',
      defaultValue: true,
    },
    {
      name: 'infinite',
      type: 'boolean',
      defaultValue: true,
    },
    {
      name: 'reviews',
      type: 'list',
      subFields: [
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
      defaultValue: [
        {
          reviewAuthor: 'Engineering',
          image:
            'https://cdn.builder.io/api/v1/image/assets%2Fpwgjf0RoYWbdnJSbpBAjXNRMe9F2%2Ffb27a7c790324294af8be1c35fe30f4d',
          reviewText: '"You guys are the best"',
        },
        {
          reviewAuthor: 'Marketing',
          image:
            'https://cdn.builder.io/api/v1/image/assets%2Fpwgjf0RoYWbdnJSbpBAjXNRMe9F2%2Ffb27a7c790324294af8be1c35fe30f4d',
          reviewText: '"Love this product"',
        },
      ],
    },
  ],
};

Builder.registerComponent(ReviewsSlider, ReviewsSliderBuilderConfig);
