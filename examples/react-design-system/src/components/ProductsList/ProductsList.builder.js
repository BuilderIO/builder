import { Builder } from '@builder.io/react';
import { ProductsList } from './ProductsList';

Builder.registerComponent(ProductsList, {
  name: 'Products List',
  inputs: [
    {
      name: 'url',
      type: 'string',
      advanced: true,
      defaultValue: 'https://api.shopstyle.com/api/v2/products',
    },
    {
      name: 'category',
      type: 'string',
      defaultValue: 'mens',
      enum: [
        'mens',
        'womens',
        'kids',
        {
          label: 'home',
          value: 'living',
        },
      ],
    },
    {
      name: 'amount',
      type: 'number',
      defaultValue: 20,
    },
    {
      name: 'size',
      type: 'string',
      defaultValue: 'Medium',
      enum: ['Small', 'Medium', 'Large'],
    },
  ],
});
