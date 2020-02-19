'use strict';
const { getGQLOptions } = require('./builder-config');

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
