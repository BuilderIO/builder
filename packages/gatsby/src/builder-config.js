const invariant = require(`invariant`);

module.exports.defaultOptions = {
  // Arbitrary name for the remote schema Query type
  fieldName: `allBuilderModels`,
  typeName: `builder`,
  limit: 30,
  baseURL: `https://cdn.builder.io/api/v1/graphql`,
  overrideDev404: true,
  // custom404Dev: 'path to custom 404'
  // globalContext: { store: process.env.STORE_TOKEN } // helpful in multi stores repo
  // filter: (entry) => entry.content.data.store === process.env.STORE_TOKEN // helpful in multi-store builder organization
};

module.exports.getGQLOptions = options => {
  const config = {
    ...module.exports.defaultOptions,
    ...options,
  };
  invariant(
    config.publicAPIKey && config.publicAPIKey.length > 0,
    `@builder.io/gatsby requires a public API Key`
  );
  if (config.limit > 100) {
    console.warning('@builder.io/gatsby maximum pagination limit is 100');
    config.limit = 100;
  }
  return {
    typeName: config.typeName,
    // Field under which the remote schema will be accessible. You'll use this in your Gatsby query
    fieldName: config.fieldName,
    // Url to query from 30
    url: `${config.baseURL}/${config.publicAPIKey}?cachebust=true`,
  };
};
