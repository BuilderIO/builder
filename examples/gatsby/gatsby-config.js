'use strict';
const path = require('path');

module.exports = {
  plugins: [
    'gatsby-plugin-typescript',
    'gatsby-plugin-react-helmet',
    {
      resolve: 'gatsby-source-graphql',
      options: getGQLOptions()
    }
  ]
};
