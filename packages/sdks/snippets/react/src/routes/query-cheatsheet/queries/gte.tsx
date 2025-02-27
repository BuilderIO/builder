import { fetchOneEntry } from '@builder.io/sdk-react';

export const getProduct = async (options: {
  apiKey: string;
  [key: string]: unknown;
}) =>
  fetchOneEntry({
    model: 'product',
    query: { 'data.price': { $gte: 700 } },
    ...options,
  });
