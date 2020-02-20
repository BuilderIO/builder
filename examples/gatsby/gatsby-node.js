'use strict';

const path = require('path');
const { config } = require('./builder-config');

// Create dynamic pages created in Builder.io
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
            everything
          }`
          )
          .join(' ')}
      }
    }
  `);

  models.forEach(modelName => {
    result.data[config.fieldName][modelName].forEach(entry => {
      if (
        entry.everything.data.url &&
        entry.everything.published === 'published'
      ) {
        createPage({
          path: entry.everything.data.url,
          component: config.templates[modelName],
          context: {
            builder: {
              content: entry.everything
            }
          }
        });
      }
    });
  });
};
