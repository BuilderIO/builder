import { Builder, withChildren } from '@builder.io/react';
import { HeroWithEditableChildren } from './HeroWithChildren';

// This line is very important! :)
const HeroWithBuilderChildren = withChildren(HeroWithEditableChildren);

Builder.registerComponent(HeroWithBuilderChildren, {
  name: 'Hero With Children',

  inputs: [
    {
      name: 'image',
      type: 'file',
      allowedFileTypes: ['jpeg', 'jpg', 'png', 'svg', 'webp'],
      required: true,
      defaultValue:
        'https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F349738e6805b481ab6c50bda7e24445e',
    },
    {
      name: 'height',
      type: 'number',
      defaultValue: 400,
      required: true,
    },
    {
      name: 'parallaxStrength',
      type: 'number',
      defaultValue: 400,
    },
  ],

  // (Optionally) specify requirements that the direct children can only be certain types
  childRequirements: {
    message: 'You can only put Buttons, Text, or Headings in a Hero',
    query: {
      'component.name': { $in: ['Button', 'Text', 'Heading'] },
    },
  },

  // It's generally best to supply some default children
  // for easy and intuitive usage in the Builder.io UIs by
  // non-devs
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
