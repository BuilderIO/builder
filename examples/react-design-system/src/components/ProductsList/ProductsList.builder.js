import { Builder } from '@builder.io/react'
import { ProductsList } from './ProductsList'

Builder.registerComponent(ProductsList, {
    name: 'Products List',
    inputs: [
      {
        name: 'url',
        type: 'string',
        defaultValue: 'https://api.shopstyle.com/api/v2/products',
      },
      {
        name: 'category',
        type: 'string',
        defaultValue: 'mens',
        enum: ['mens', 'womens', {
          label: 'home',
          value: 'living'
        }]
      },
      {
          name: 'limit',
          type: 'number',
          defaultValue: 20
      },
      {
        name: 'spacing',
        type: 'number',
        defaultValue: 3
      },
      {
        name: 'columns',
        type: 'number',
        defaultValue: 3
      },
      {
        name: 'image',
        type: 'string',
        defaultValue: 'Large',
        enum: ['Small', 'Medium', 'Large', 'XLarge']
      }
    ]
})