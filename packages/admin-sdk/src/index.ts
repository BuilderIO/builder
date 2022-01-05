export * from './autogen/client/createClient';
export * from './autogen/client/schema';

import { createClient } from './autogen/client/createClient';

const root = 'https://cdn.builder.io';

export const createAdminApiClient = (privateKey: string) =>
  createClient({
    fetcher: ({ query, variables }, fetch) =>
      fetch(`${root}/api/v2/admin`, {
        method: 'POST',
        body: JSON.stringify({ query, variables }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${privateKey}`,
        },
      }).then(r => r.json()),
  });
