import { Builder } from '@builder.io/react';
import { ProductsListWithServerSideData } from './ProductsListWithServerSideData';

Builder.registerComponent(ProductsListWithServerSideData, {
  name: 'Products List SSR',
  inputs: [
    {
      name: 'products',
      defaultValue: {
        '@type': '@builder.io/core:Request',
        request: {
          url: 'https://api.shopstyle.com/api/v2/products',
        },
        bindings: {
          'request.query.limit': 'amount',
          // We don't really need to call .toLowerCase, just want to demonstrate this
          // takes arbitrary javascript :)
          // any expression is supported - e.g. "category ? 'foo' : 'bar'", etc
          'request.query.cat': 'category.toLowerCase()',
        },
      },
    },
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
});
