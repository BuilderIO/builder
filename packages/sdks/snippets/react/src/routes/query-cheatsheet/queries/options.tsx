import { fetchOneEntry } from '@builder.io/sdk-react';

export const getProduct = async (options: {
  apiKey: string;
  [key: string]: unknown;
}) =>
  fetchOneEntry({
    model: 'contact-record',
    query: { 'data.surname': { $regex: 'ha.*', $options: 'i' } },
    ...options,
  });
