import dynamic from 'next/dynamic'
import { Builder } from '@builder.io/react'

Builder.registerComponent(
  dynamic(() => import('./hero')),
  {
    name: 'Hero',
    description: 'Hero Component',
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
        name: 'subtitle',
        type: 'string',
        defaultValue: 'Your SubTitle Here',
      },
      {
        name: 'imageSrc',
        friendlyName: 'Hero Image',
        type: 'file',
        allowedFileTypes: ['jpeg', 'jpg', 'png', 'svg', 'webp'],
        required: true,
        defaultValue:
          'https://cdn.builder.io/api/v1/image/assets%2Fe7eb284a1bc549c8856f32d1fc7a44cf%2F992e8c492ebc491badb17b91c4f7d6fd',
      },
    ],
  }
)
