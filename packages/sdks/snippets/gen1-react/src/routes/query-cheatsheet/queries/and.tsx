import { builder } from '@builder.io/react';

export const getProduct = (options: { [key: string]: any }) =>
  builder.get('product', {
    query: {
      'data.price': {
        $and: [{ $lt: 1000 }, { $gt: 500 }],
      },
    },
    ...options,
  });
