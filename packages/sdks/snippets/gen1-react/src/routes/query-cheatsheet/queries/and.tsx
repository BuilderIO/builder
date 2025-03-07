import { builder } from '@builder.io/react';
import type { GetContentOptions } from '@builder.io/sdk';

export const getProduct = (options: GetContentOptions) =>
  builder.get('product', {
    query: {
      'data.price': {
        $and: [{ $lt: 1000 }, { $gt: 500 }],
      },
    },
    ...options,
  });
