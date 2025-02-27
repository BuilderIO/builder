import { builder } from '@builder.io/react';

export const getProduct = async (options: { [key: string]: any }) =>
  builder.get('contact-record', {
    query: { 'data.regions': { $elemMatch: { location: 'US West' } } },
    ...options,
  });
