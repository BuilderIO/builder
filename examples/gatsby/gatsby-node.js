'use strict';

const path = require('path');
const { config } = require('./builder-config');

// Create dynamic pages created in Builder.io for
// every "page" model by it's URL
// 
// See https://builder.io/c/docs/graphql-api for more info on our
// GraphQL API and our explorer
// 
exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;
  const models = Object.keys(config.templates);
  const result = await graphql(`
    query {
      ${config.fieldName} {
        ${models
          .map(
            model =>
              `${model} {
            content
          }`
          )
          .join(' ')}
      }
    }
  `);

  models.forEach(modelName => {
    result.data[config.fieldName][modelName].forEach(entry => {
      if (entry.content.data.url) {
        createPage({
          path: entry.content.data.url,
          component: config.templates[modelName],
          context: {
            builder: {
              content: entry.content
            }
          }
        });
      }
    });
  });
};
