import { builder } from '@builder.io/react';

export const getProduct = async (options: { [key: string]: any }) =>
  builder.get('product', {
    query: { 'data.price': { $lte: 455 } },
    ...options,
  });
