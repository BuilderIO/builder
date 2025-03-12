import { fetchOneEntry, GetContentOptions } from '@builder.io/sdk-react';

export default function targetedRequest(options: GetContentOptions) {
  return fetchOneEntry({
    ...options,
    userAttributes: {
      device: 'desktop',
      urlPath: options.userAttributes?.urlPath,
      ...options.userAttributes, // Include additional userAttributes
    },
  });
}
