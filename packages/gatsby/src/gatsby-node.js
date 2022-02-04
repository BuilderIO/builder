const { defaultOptions } = require('./constants');
const invariant = require(`invariant`);
const fs = require('fs');
/**
 *
 * @typedef {{
 *  graphql: import('gatsby').CreatePagesArgs['graphql'],
 *  fieldName: any,
 *  models: any,
 *  offsets: any,
 *  limit: any
 * }} FetchPagesArgs
 *
 *
 * @param {FetchPagesArgs} param0
 */
const fetchPages = ({ fieldName, models, offsets, graphql, limit }) =>
  graphql(`
    query {
      ${fieldName} {
        ${models
          .map(
            (
              model,
              index
            ) => `${model}(limit: ${limit}, offset: ${offsets[index]}, options: { cacheSeconds: 2, staleCacheSeconds: 2 }) {
            content
          }`
          )
          .join(` `)}
      }
    }
  `);

/**
 *
 * @param {*} config
 * @param {*} createPage
 * @param {import('gatsby').CreatePagesArgs['graphql']} graphql
 * @param {*} models
 * @param {*} offsets
 */
const createPagesAsync = async (config, createPage, graphql, models, offsets) => {
  const result = await fetchPages({
    fieldName: config.fieldName,
    models,
    offsets,
    graphql,
    limit: config.limit,
  });

  let hasMore = false;
  for (let index = 0; index < models.length; index++) {
    const modelName = models[index];

    const component = config.templates[modelName];
    invariant(
      fs.existsSync(component),
      `@builder.io/gatsby requires a valid template path for each model`
    );
    let entries = result.data[config.fieldName][modelName];
    offsets[index] = offsets[index] + entries.length;

    if (entries.length === config.limit) {
      hasMore = true;
    }

    if (config.filter) {
      entries = entries.filter(config.filter);
    }

    if (config.resolveDynamicEntries) {
      entries = await config.resolveDynamicEntries(entries);
    }

    for (const entry of entries) {
      if (entry.content.data.url && entry.content.published === `published`) {
        let mappedProps = {};

        if (config.mapEntryToContext) {
          mappedProps = await config.mapEntryToContext(entry, graphql);
        }

        createPage({
          path: entry.content.data.url,
          component,
          context: {
            ...(config.globalContext || {}),
            ...mappedProps,
          },
        });
      }
    }
  }
  if (hasMore) {
    await createPagesAsync(config, createPage, graphql, models, offsets);
  }
};

/**
 * @type { import('gatsby').GatsbyNode['onCreatePage'] }
 */
exports.onCreatePage = ({ page, actions }, options) => {
  const { deletePage, createPage } = actions;
  const config = {
    ...defaultOptions,
    ...options,
  };

  if (page.path === '/dev-404-page/' && config.overrideDev404) {
    const modelName = Object.keys(config.templates || {})[0];
    const context = {
      noStaticContent: true,
      ...page.context,
    };

    // override gatsby's custom 404 dev to allow development on Builder.io
    // with new pages without having to regenerate (restart gatsby develop)
    if (typeof config.custom404Dev === 'string') {
      deletePage(page);
      createPage({
        ...page,
        component: config.custom404Dev,
        context,
      });
    } else if (modelName) {
      deletePage(page);
      createPage({
        ...page,
        component: config.templates[modelName],
        context,
      });
    }
  }
};

exports.createPages = async ({ graphql, actions }, options) => {
  const config = {
    ...defaultOptions,
    ...options,
  };
  const { createPage } = actions;
  if (typeof config.templates === 'object') {
    const models = Object.keys(config.templates);
    const offsets = models.map(() => 0);
    await createPagesAsync(config, createPage, graphql, models, offsets);
  }
};
