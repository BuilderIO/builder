const invariant = require(`invariant`);

module.exports.defaultOptions = {
  // Arbitrary name for the remote schema Query type
  fieldName: `allBuilderModels`,
  typeName: `builder`,
  limit: 30,
  baseURL: `https://cdn.builder.io/api/v1/graphql`,
  overrideDev404: true,
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
  return {
    typeName: config.typeName,
    // Field under which the remote schema will be accessible. You'll use this in your Gatsby query
    fieldName: config.fieldName,
    // Url to query from 30
    url: `${config.baseURL}/${config.publicAPIKey}?cachebust=true`,
  };
};
