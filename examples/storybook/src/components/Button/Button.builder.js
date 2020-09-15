import { Builder } from '@builder.io/react';
import { Button } from './Button';

Builder.registerComponent(Button, {
  name: 'Button',
  inputs: [
    {
      name: 'text',
      type: 'string',
      required: true,
      defaultValue: 'Click me',
    },
    {
      name: 'link',
      type: 'url',
      required: true,
      defaultValue: '/foobar',
    },
    {
      name: 'type',
      type: 'string',
      required: true,
      enum: ['outlined', 'text', 'contained'],
      defaultValue: 'outlined',
    },
  ],
});
