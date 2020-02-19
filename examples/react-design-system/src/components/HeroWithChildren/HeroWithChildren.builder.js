import { Builder } from '@builder.io/react';
import { HeroWithEditableChildren } from './HeroWithChildren';

Builder.registerComponent(HeroWithEditableChildren, {
  name: 'Hero With Children',
  canHaveChildren: true,
  inputs: [
    {
      name: 'image',
      type: 'file',
      allowedFileTypes: ['jpeg', 'jpg', 'png', 'svg'],
      required: true,
      defaultValue:
        'https://cdn.builder.io/api/v1/image/assets%2Fpwgjf0RoYWbdnJSbpBAjXNRMe9F2%2Ffb27a7c790324294af8be1c35fe30f4d',
    },
    {
      name: 'height',
      type: 'number',
      defaultValue: 400,
      required: true,
    },
  ],
  defaultChildren: [
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
    {
      '@type': '@builder.io/sdk:Element',
      component: {
        name: 'Text',
        options: {
          text: 'You can edit this too. Or duplicate it. Or delete it!',
        },
      },
      responsiveStyles: {
        large: {
          marginTop: '20px',
        },
      },
    },
    {
      '@type': '@builder.io/sdk:Element',
      component: {
        name: 'Button',
        options: {
          text: 'Hello',
          type: 'outlined',
        },
      },
      responsiveStyles: {
        large: {
          marginTop: '20px',
        },
      },
    },
  ],
});
