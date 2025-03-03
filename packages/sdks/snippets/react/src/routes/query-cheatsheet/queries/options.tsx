import { fetchOneEntry, GetContentOptions } from '@builder.io/sdk-react';

export const getProduct = (options: GetContentOptions) =>
  fetchOneEntry({
    query: { 'data.surname': { $regex: 'ha.*', $options: 'i' } },
    ...options,
  });
