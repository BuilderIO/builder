/**
 * @type {import('gatsby').GatsbyConfig}
 */

const path = require('path');

module.exports = {
  siteMetadata: {
    title: `Gatsby Minimal Starter`,
    siteUrl: `https://www.yourdomain.tld`,
  },
  plugins: [
    'gatsby-plugin-typescript',
    {
      resolve: '@builder.io/gatsby',
      options: {
        /** TODO: update this with your API key! */
        publicAPIKey: 'jdGaMusrVpYgdcAnAtgn',
        useCache: false,
        // to allow editing on local host
        custom404Dev: path.resolve('src/pages/404.jsx'),
        templates: {
          // Render every `page` model as a new page using the /page.tsx template
          // based on the URL provided in Builder.io
          page: path.resolve('src/templates/page.jsx'),
        },
      },
    },
  ],
};
