import { builder } from '@builder.io/react';

export const getProduct = (options: { [key: string]: any }) =>
  builder.get('contact-record', {
    query: { 'data.employmentDate': { $type: Date } },
    ...options,
  });
