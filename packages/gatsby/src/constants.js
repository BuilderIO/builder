export const defaultOptions = {
  // Arbitrary name for the remote schema Query type
  fieldName: `allBuilderModels`,
  typeName: `builder`,
  limit: 30,
  baseURL: `https://cdn.builder.io/api/v1/graphql`,
  overrideDev404: true,
  useCache: false,
  batch: true,
  // custom404Dev: 'path to custom 404'
  // globalContext: { store: process.env.STORE_TOKEN } // helpful in multi stores repo
  // filter: (entry) => entry.content.data.store === process.env.STORE_TOKEN // helpful in multi-store builder organization
};
