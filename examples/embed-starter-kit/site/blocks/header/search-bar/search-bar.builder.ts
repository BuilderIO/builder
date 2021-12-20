import dynamic from 'next/dynamic'
import { Builder } from '@builder.io/react'

Builder.registerComponent(
  dynamic(() => import('./search-bar')),
  {
    name: 'Search',
    description: 'Search bar',
    image:
      'https://cdn.builder.io/api/v1/image/assets%2Fe7eb284a1bc549c8856f32d1fc7a44cf%2Fcdb59d65a5bb453da47dd8e55a740884',
  }
)
