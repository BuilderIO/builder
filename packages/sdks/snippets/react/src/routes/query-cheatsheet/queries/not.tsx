import { fetchOneEntry, GetContentOptions } from '@builder.io/sdk-react';

export const getProduct = (options: GetContentOptions) =>
  fetchOneEntry({
    query: { 'data.department': { $not: 'Marketing' } },
    ...options,
  });
