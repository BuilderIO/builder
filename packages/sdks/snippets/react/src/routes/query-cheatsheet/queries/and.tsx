import { fetchOneEntry, GetContentOptions } from '@builder.io/sdk-react';

export const getProduct = (options: GetContentOptions) =>
  fetchOneEntry({
    query: {
      'data.price': {
        $and: [{ $lt: 1000 }, { $gt: 500 }],
      },
    },
    ...options,
  });
