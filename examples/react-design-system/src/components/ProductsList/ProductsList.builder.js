import { Builder } from '@builder.io/react';
import { ProductsList } from './ProductsList';
export const ProductsListBuilderConfig = {
  name: 'Products List',
  inputs: [
    {
      name: 'category',
      type: 'string',
      defaultValue: 'mens',
      enum: [
        {
          label: 'Women',
          value: 'womens-fashion',
        },
        {
          label: 'Mens',
          value: 'mens-clothes',
        },
        {
          label: 'Kids',
          value: 'kids-and-baby',
        },
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
};

Builder.registerComponent(ProductsList, ProductsListBuilderConfig);
