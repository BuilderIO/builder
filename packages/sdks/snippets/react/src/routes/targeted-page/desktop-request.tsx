import { fetchOneEntry, GetContentOptions } from '@builder.io/sdk-react';

export default function targetedRequest(
  urlPath: string,
  { apiKey, model }: GetContentOptions
) {
  return fetchOneEntry({
    apiKey,
    model,
    userAttributes: {
      device: 'desktop',
      urlPath,
    },
  });
}
