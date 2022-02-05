const { createHttpLink } = require(`apollo-link-http`);
const { RetryLink } = require(`apollo-link-retry`);
const { defaultOptions } = require('./constants');
const { ApolloLink } = require('apollo-link');
const invariant = require(`invariant`);
const nodeFetch = require('node-fetch');

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

module.exports = options => {
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
    batch: config.batch,
    createLink: pluginOptions =>
      ApolloLink.from([retryLink, createHttpLink({ uri: pluginOptions.url, fetch: nodeFetch })]),
  };

  return {
    plugins: [
      {
        resolve: require.resolve('./plugins/gatsby-source-graphql-fork'),
        options: graphqlOptions,
      },
    ],
  };
};
