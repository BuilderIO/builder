import { fetchOneEntry, GetContentOptions } from '@builder.io/sdk-react';

export default function request(
  urlPath: string,
  { apiKey, model }: GetContentOptions
) {
  return fetchOneEntry({
    apiKey,
    model,
    userAttributes: {
      device: 'mobile',
      urlPath,
    },
  });
}
