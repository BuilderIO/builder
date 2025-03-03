import { builder } from '@builder.io/react';

export default ({ model, urlPath }: { model: string; urlPath: string }) =>
  builder.get(model, {
    userAttributes: {
      device: 'desktop',
      urlPath,
    },
  });
