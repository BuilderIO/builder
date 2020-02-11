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
        enum: ['mens', 'womens', 'shoes']
      },
      {
          name: 'limit',
          type: 'number',
          defaultValue: 20
      }
    ]
})