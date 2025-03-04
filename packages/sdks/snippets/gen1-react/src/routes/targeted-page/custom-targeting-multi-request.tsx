import { builder } from '@builder.io/react';
import type { GetContentOptions } from '@builder.io/sdk';

export default function targetedRequest({ model, url }: GetContentOptions) {
  return builder.get(model!, {
    userAttributes: {
      audience: ['recent-shopper', 'womens-fashion'],
      urlPath: url,
    },
  });
}
