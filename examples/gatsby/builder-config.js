const path = require('path');

module.exports.config = {
  fieldName: 'allBuilderPages',
  typeName: 'builder',
  publicAPIKey: 'YJIGb4i01jvw0SRdL5Bt',
  templates: {
    docsContent: path.resolve('src/templates/page.tsx'),
    contentPage: path.resolve('src/templates/page.tsx')
  }
};

module.exports.getGQLOptions = (options = module.exports.config) => {
  return {
    // Arbitrary name for the remote schema Query type
    typeName: options.typeName,
    // Field under which the remote schema will be accessible. You'll use this in your Gatsby query
    fieldName: options.fieldName,
    // Url to query from 30
    url: `https://cdn.builder.io/api/v1/graphql/${options.publicAPIKey}`
  };
};
