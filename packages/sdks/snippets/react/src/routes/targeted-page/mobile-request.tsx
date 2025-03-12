import { fetchOneEntry, GetContentOptions } from '@builder.io/sdk-react';

export default function targetedRequest(options: GetContentOptions) {
  return fetchOneEntry({
    ...options,
    userAttributes: {
      device: 'mobile',
      ...options.userAttributes,
    },
  });
}
