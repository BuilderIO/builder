const path = require('path');

module.exports.config = {
  fieldName: 'allBuilderPages',
  typeName: 'builder',
  // Update this to your API key
  publicAPIKey: 'YOUR_API_KEY',
  templates: {
    // Render every `page` model as a new page using the /page.tsx template
    // based on the URL provided in Builder.io
    page: path.resolve('src/templates/page.tsx'),
  }
};

module.exports.getGQLOptions = (options = module.exports.config) => {
  return {
    // Arbitrary name for the remote schema Query type
    typeName: options.typeName,
    // Field under which the remote schema will be accessible. You'll use this in your Gatsby query
    fieldName: options.fieldName,
    // Url to query from
    url: `https://cdn.builder.io/api/v1/graphql/${options.publicAPIKey}`
  };
};
