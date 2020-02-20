'use strict';
const path = require('path');

module.exports = {
  plugins: [
    'gatsby-plugin-typescript',
    'gatsby-plugin-react-helmet',
    {
      resolve: 'gatsby-plugin-builder',
      options: {
        publicAPIKey: 'YJIGb4i01jvw0SRdL5Bt',
        templates: {
          docsContent: path.resolve('src/templates/page.tsx'),
        }
      }
    }
  ]
};
