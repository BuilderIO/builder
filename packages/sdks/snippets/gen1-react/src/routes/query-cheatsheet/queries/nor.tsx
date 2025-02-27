import { builder } from '@builder.io/react';

export const getProduct = async (options: { [key: string]: any }) =>
  builder.get('product', {
    query: {
      'data.price': {
        $nor: [{ $lt: 500 }, { $gt: 1000 }],
      },
    },
    ...options,
  });
