import { builder } from '@builder.io/react';

export default async ({ model, urlPath }: { model: string; urlPath: string }) =>
  builder.get(model, {
    userAttributes: {
      device: 'mobile',
      urlPath,
    },
  });
