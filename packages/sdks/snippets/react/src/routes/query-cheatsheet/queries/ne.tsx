import { fetchOneEntry, GetContentOptions } from '@builder.io/sdk-react';

export const getProduct = (options: GetContentOptions) =>
  fetchOneEntry({
    query: { 'data.department': { $ne: 'Human Resources' } },
    ...options,
  });
