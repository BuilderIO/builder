const { defaultOptions, getConfig } = require('./constants');
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
      const paths = getPaths(entry.content);
      if (paths.length > 0 && entry.content.published === `published`) {
        let mappedProps = {};

        if (config.mapEntryToContext) {
          mappedProps = await config.mapEntryToContext(entry, graphql);
        }
        paths.forEach(path => {
          createPage({
            path,
            component,
            context: {
              ...(config.globalContext || {}),
              ...mappedProps,
            },
          });
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

const { uuid } = require(`gatsby-core-utils`);
const { buildSchema, printSchema } = require(`gatsby/graphql`);
const { wrapSchema, introspectSchema, RenameTypes } = require(`@graphql-tools/wrap`);
const { linkToExecutor } = require(`@graphql-tools/links`);

const { NamespaceUnderFieldTransform, StripNonQueryTransform } = require(`./transforms`);

exports.createSchemaCustomization = async ({ actions, createNodeId, cache }, baseOptions) => {
  const options = getConfig(baseOptions);
  const { addThirdPartySchema } = actions;
  const { typeName, fieldName, createLink, createSchema, transformSchema } = options;

  const link = await createLink(options);
  let introspectionSchema;

  if (createSchema) {
    introspectionSchema = await createSchema(options);
  } else {
    const cacheKey = `gatsby-source-graphql-schema-${typeName}-${fieldName}`;
    let sdl = await cache.get(cacheKey);

    if (!sdl) {
      introspectionSchema = await introspectSchema(linkToExecutor(link));
      sdl = printSchema(introspectionSchema);
    } else {
      introspectionSchema = buildSchema(sdl);
    }

    await cache.set(cacheKey, sdl);
  }

  // This node is created in `sourceNodes`.
  const nodeId = createSchemaNodeId({ typeName, createNodeId });

  const resolver = (parent, args, context) => {
    context.nodeModel.createPageDependency({
      path: context.path,
      nodeId: nodeId,
    });
    return {};
  };

  const defaultTransforms = [
    new StripNonQueryTransform(),
    new RenameTypes(name => `${typeName}_${name}`),
    new NamespaceUnderFieldTransform({
      typeName,
      fieldName,
      resolver,
    }),
  ];

  const schema = transformSchema
    ? transformSchema({
        schema: introspectionSchema,
        link,
        resolver,
        defaultTransforms,
        options,
      })
    : wrapSchema({
        schema: introspectionSchema,
        executor: linkToExecutor(link),
        transforms: defaultTransforms,
      });

  addThirdPartySchema({ schema });
};

exports.sourceNodes = async ({ actions, createNodeId, createContentDigest }, baseOptions) => {
  const options = getConfig(baseOptions);
  const { createNode } = actions;
  const { typeName, fieldName, refetchInterval } = options;

  const nodeId = createSchemaNodeId({ typeName, createNodeId });
  const node = createSchemaNode({
    id: nodeId,
    typeName,
    fieldName,
    createContentDigest,
  });
  createNode(node);

  if (process.env.NODE_ENV !== `production`) {
    if (refetchInterval) {
      const msRefetchInterval = refetchInterval * 1000;
      const refetcher = () => {
        createNode(
          createSchemaNode({
            id: nodeId,
            typeName,
            fieldName,
            createContentDigest,
          })
        );
        setTimeout(refetcher, msRefetchInterval);
      };
      setTimeout(refetcher, msRefetchInterval);
    }
  }
};

function createSchemaNodeId({ typeName, createNodeId }) {
  return createNodeId(`builder-gatsby-source-graphql-${typeName}`);
}

function createSchemaNode({ id, typeName, fieldName, createContentDigest }) {
  const nodeContent = uuid.v4();
  const nodeContentDigest = createContentDigest(nodeContent);
  return {
    id,
    typeName: typeName,
    fieldName: fieldName,
    parent: null,
    children: [],
    internal: {
      type: `BuilderGraphQLSource`,
      contentDigest: nodeContentDigest,
      ignoreType: true,
    },
  };
}

function getPaths(content) {
  let urls = content?.query?.find(attribute => attribute.property === 'urlPath')?.value;

  if (typeof urls === 'string') {
    urls = [urls];
  }

  return urls || [];
}
