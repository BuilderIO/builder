const { createHttpLink, ApolloLink } = require(`@apollo/client`);
const { RetryLink } = require(`@apollo/client/link/retry`);
const invariant = require(`invariant`);
const nodeFetch = require('node-fetch');
const { createDataloaderLink } = require(`./batching/dataloader-link`);

const retryLink = new RetryLink({
  delay: {
    initial: 100,
    max: 2000,
    jitter: true,
  },
  attempts: {
    max: 5,
    retryIf: (error, operation) =>
      Boolean(error) && ![400, 401, 403, 404].includes(error.statusCode),
  },
});

export const defaultOptions = {
  // Arbitrary name for the remote schema Query type
  fieldName: `allBuilderModels`,
  typeName: `builder`,
  limit: 30,
  baseURL: `https://cdn.builder.io/api/v3/graphql`,
  overrideDev404: true,
  useCache: false,
  batch: true,
  // custom404Dev: 'path to custom 404'
  // globalContext: { store: process.env.STORE_TOKEN } // helpful in multi stores repo
  // filter: (entry) => entry.content.data.store === process.env.STORE_TOKEN // helpful in multi-store builder organization
};

export function getConfig(options) {
  const config = {
    ...defaultOptions,
    ...options,
  };

  invariant(
    config.publicAPIKey && config.publicAPIKey.length > 0,
    `@builder.io/gatsby requires a public API Key`
  );

  invariant(config.limit < 101, '@builder.io/gatsby maximum pagination limit is 100');

  const graphqlOptions = {
    typeName: config.typeName,
    // Field under which the remote schema will be accessible. You'll use this in your Gatsby query
    fieldName: config.fieldName,
    // Url to query from 30
    url: `${config.baseURL}/${config.publicAPIKey}?${!config.useCache ? 'cachebust=true' : ''}`,
    createLink: async ({ headers, url }) => {
      const options = {
        headers: typeof headers === `function` ? await headers() : headers,
      };
      return ApolloLink.from([retryLink, createDataloaderLink({ uri: url, fetch: nodeFetch })]);
    },
  };

  return {
    ...config,
    ...graphqlOptions,
  };
}
