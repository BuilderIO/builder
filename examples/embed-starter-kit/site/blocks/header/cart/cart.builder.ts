import dynamic from 'next/dynamic'
import { Builder } from '@builder.io/react'

Builder.registerComponent(
  dynamic(() => import('./cart')),
  {
    name: 'Cart',
    description: 'Cart button',
    image:
      'https://cdn.builder.io/api/v1/image/assets%2Fe7eb284a1bc549c8856f32d1fc7a44cf%2F32c90ca2aa1a4812bc9314bae1b795c6',
  }
)
