import { builder } from '@builder.io/react';

export const getProduct = (options: { [key: string]: any }) =>
  builder.get('contact-record', {
    query: { 'data.department': { $in: ['Marketing', 'Engineering'] } },
    ...options,
  });
