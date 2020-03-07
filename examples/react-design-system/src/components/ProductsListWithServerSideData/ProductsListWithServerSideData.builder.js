import { Builder } from '@builder.io/react';
import { ProductsListWithServerSideData } from './ProductsListWithServerSideData';

const defaultProductsQueryParams = {
  limit: '20',
  cat: 'womens-clothes',
  view: 'web',
  pid: 'shopstyle',
};
const productQueryHeaders = { 'content-type': 'application/json' };

Builder.registerComponent(ProductsListWithServerSideData, {
  name: 'Products List SSR',
  inputs: [
    {
      name: 'products',
      type: 'request',
      // Hide this from the UIs
      hidden: true,
      defaultValue: {
        '@type': '@builder.io/core:Request',
        request: {
          url: 'https://api.shopstyle.com/api/v2/products',
          // Optional
          query: defaultProductsQueryParams,
          // Optional
          headers: productQueryHeaders,
        },
        bindings: {
          'query.limit': 'amount',
          // any expression is supported - e.g. "category ? 'foo' : 'bar'", etc
          'query.cat': 'category || "womens-fashion"',
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
