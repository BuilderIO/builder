import dynamic from 'next/dynamic'
import { Builder } from '@builder.io/react'

Builder.registerComponent(
  dynamic(() => import('./double-columns')),
  {
    name: 'Double Columns',
    description: 'Two columns side by side',
    // Optionally give a custom icon (image url - ideally a black on transparent bg svg or png)
    image:
      'https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fd3fad4746b794e59a7bc6ba502ec4f44',
    inputs: [
      {
        name: 'text1',
        type: 'string',
        defaultValue: 'Your Title Here',
      },
      {
        name: 'image1',
        type: 'file',
        allowedFileTypes: ['jpeg', 'jpg', 'png', 'svg', 'webp'],
        required: true,
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
        allowedFileTypes: ['jpeg', 'jpg', 'png', 'svg', 'webp'],
        required: true,
        defaultValue:
          'https://cdn.builder.io/api/v1/image/assets%2Fpwgjf0RoYWbdnJSbpBAjXNRMe9F2%2Ffb27a7c790324294af8be1c35fe30f4d',
      },
    ],
  }
)
