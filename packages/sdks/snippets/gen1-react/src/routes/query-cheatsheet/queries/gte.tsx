import { builder } from '@builder.io/react';

export const getProduct = (options: { [key: string]: any }) =>
  builder.get('product', {
    query: { 'data.price': { $gte: 700 } },
    ...options,
  });
