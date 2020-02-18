import { Builder } from '@builder.io/react';
import { Hero } from './Hero';

Builder.registerComponent(Hero, {
  name: 'MyHero',
  canHaveChildren: true,
  inputs: [
    {
      name: 'darkMode',
      type: 'boolean',
      defaultValue: false,
    },
    {
      name: 'buttonLink',
      type: 'string',
      defaultValue: 'https://example.com',
    },
    {
      name: 'buttonText',
      type: 'string',
      defaultValue: 'Click',
    },

    {
      name: 'title',
      type: 'string',
      defaultValue: 'Your Title Here',
    },

    {
      name: 'height',
      type: 'string',
      defaultValue: '400px',
    },

    {
      name: 'strength',
      type: 'number',
      defaultValue: 400,
    },
    {
      name: 'image',
      type: 'file',
      allowedFileTypes: ['jpeg', 'jpg', 'png', 'svg'],
      required: true,
      defaultValue:
        'https://cdn.builder.io/api/v1/image/assets%2Fpwgjf0RoYWbdnJSbpBAjXNRMe9F2%2Ffb27a7c790324294af8be1c35fe30f4d',
    },
  ],
});
