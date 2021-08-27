import { Builder } from '@builder.io/react';
import { ProductsList } from './ProductsList';
export const ProductsListBuilderConfig = {
  name: 'Products List',
  inputs: [
    {
      name: 'category',
      type: 'string',
      defaultValue: 'charm',
      enum: [
        {
          label: 'Charms',
          value: 'charm',
        },
        {
          label: 'Necklaces',
          value: 'necklace',
        },
        {
          label: 'Pendants',
          value: 'pendant',
        },
        {
          label: 'Bracelets',
          value: 'bracelet',
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
