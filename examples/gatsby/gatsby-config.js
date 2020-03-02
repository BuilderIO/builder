'use strict';
const path = require('path');

module.exports = {
  plugins: [
    'gatsby-plugin-typescript',
    'gatsby-plugin-react-helmet',
    {
      resolve: '@builder.io/gatsby',
      options: {
        // Update this to your API key
        publicAPIKey: 'YOUR_API_KEY',
        templates: {
          // Render every `page` model as a new page using the /page.tsx template
          // based on the URL provided in Builder.io
          page: path.resolve('src/templates/page.tsx'),
        }
      }
    }
  ]
};
