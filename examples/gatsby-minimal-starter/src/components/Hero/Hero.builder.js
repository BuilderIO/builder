import { Builder } from '@builder.io/react';
import Hero from './Hero.jsx';

Builder.registerComponent(Hero, {
  name: 'Hero',
  // Optionally give a custom icon (image url - ideally a black on transparent bg svg or png)
  image:
    'https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fd6d3bc814ffd47b182ec8345cc5438c0',
  inputs: [
    {
      name: 'title',
      type: 'string',
      defaultValue: 'Your Title Here',
    },
    {
      name: 'image',
      type: 'file',
      allowedFileTypes: ['jpeg', 'jpg', 'png', 'svg', 'webp'],
      required: true,
      defaultValue:
        'https://cdn.vectorstock.com/i/preview-1x/65/30/default-image-icon-missing-picture-page-vector-40546530.jpg',
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
      name: 'height',
      type: 'number',
      defaultValue: 400,
    },
    {
      name: 'darkMode',
      type: 'boolean',
      defaultValue: false,
    },
    // `advanced: true` hides this option under the "show advanced" toggle
    {
      name: 'parallaxStrength',
      type: 'number',
      advanced: true,
      defaultValue: 400,
    },
  ],
});
