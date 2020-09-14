import { Builder } from '@builder.io/react';
import { Heading } from './Heading';

Builder.registerComponent(Heading, {
  name: 'Heading',

  inputs: [
    {
      type: 'string',
      name: 'text',
      required: true,
      defaultValue: 'Hello there!',
    },
    {
      type: 'string',
      name: 'type',
      required: true,
      enum: [
        {
          lable: 'Heading 1',
          value: 'h1',
        },
        {
          lable: 'Heading 2',
          value: 'h2',
        },
        {
          lable: 'Heading 3',
          value: 'h3',
        },
        {
          lable: 'Heading 4',
          value: 'h4',
        },
      ],
      defaultValue: 'h1',
    },
  ],
});
