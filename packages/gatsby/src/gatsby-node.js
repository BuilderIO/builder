const uuidv4 = require(`uuid/v4`);
const fs = require(`fs`);
const { buildSchema, printSchema } = require(`gatsby/graphql`);
const { transformSchema, introspectSchema, RenameTypes } = require(`graphql-tools-fork`);
const { createHttpLink } = require(`apollo-link-http`);
const fetch = require(`node-fetch`);
const invariant = require(`invariant`);

const { NamespaceUnderFieldTransform, StripNonQueryTransform } = require(`./transforms`);
const { getGQLOptions, defaultOptions } = require(`./builder-config`);

exports.sourceNodes = async ({ actions, createNodeId, cache, createContentDigest }, options) => {
  const { addThirdPartySchema, createNode } = actions;
  const config = getGQLOptions(options);
  const { url, typeName, fieldName } = config;

  const link = createHttpLink({
    uri: url,
    fetch,
  });

  const cacheKey = `@builder.io/gatsby-schema-${typeName}-${fieldName}`;
  let sdl = await cache.get(cacheKey);
  let introspectionSchema;

  if (!sdl) {
    introspectionSchema = await introspectSchema(link);
    sdl = printSchema(introspectionSchema);
  } else {
    introspectionSchema = buildSchema(sdl);
  }

  await cache.set(cacheKey, sdl);

  const nodeId = createNodeId(`@builder.io/gatsby-${typeName}`);
  const node = createSchemaNode({
    id: nodeId,
    typeName,
    fieldName,
    createContentDigest,
  });
  createNode(node);

  const resolver = (_, __, context) => {
    const { path, nodeModel } = context;
    nodeModel.createPageDependency({
      path,
      nodeId,
    });
    return {};
  };

  const schema = transformSchema(
    {
      schema: introspectionSchema,
      link,
    },
    [
      new StripNonQueryTransform(),
      new RenameTypes(name => `${typeName}_${name}`),
      new NamespaceUnderFieldTransform({
        typeName,
        fieldName,
        resolver,
      }),
    ]
  );

  addThirdPartySchema({ schema });
};

function createSchemaNode({ id, typeName, fieldName, createContentDigest }) {
  const contentDigest = createContentDigest(uuidv4());
  return {
    id,
    typeName,
    fieldName,
    parent: null,
    children: [],
    internal: {
      type: `BuilderPlugin`,
      contentDigest,
      ignoreType: true,
    },
  };
}

exports.createPages = async ({ graphql, actions }, options) => {
  const config = {
    ...defaultOptions,
    ...options,
  };
  const { createPage } = actions;
  const models = Object.keys(config.templates);
  const offsets = models.map(() => 0);
  await createPagesAsync(config, createPage, graphql, models, offsets);
};

const createPagesAsync = async (config, createPage, graphql, models, offsets) => {
  const result = await graphql(`
    query {
      ${config.fieldName} {
        ${models
          .map(
            (
              model,
              index
            ) => `${model}(limit: ${config.limit}, offset: ${offsets[index]}, options: { cachebust: true }) {
            content
          }`
          )
          .join(` `)}
      }
    }
  `);
  let hasMore = false;
  models.forEach((modelName, index) => {
    const component = config.templates[modelName];
    invariant(
      fs.existsSync(component),
      `@builder.io/gatsby requires a valid template path for each model`
    );
    const entries = result.data[config.fieldName][modelName];
    offsets[index] = offsets[index] + entries.length;
    if (entries.length === config.limit) {
      hasMore = true;
    }
    entries.forEach(entry => {
      if (entry.content.data.url && entry.content.published === `published`) {
        createPage({
          path: entry.content.data.url,
          component,
        });
      }
    });
  });
  if (hasMore) {
    await createPagesAsync(config, createPage, graphql, models, offsets);
  }
};

exports.onCreatePage = ({ page, actions }, options) => {
  const { deletePage, createPage } = actions;
  const config = {
    ...defaultOptions,
    ...options,
  };
  const modelName = Object.keys(config.templates || {})[0];
  // override gatsby's custom 404 dev to allow development on Builder.io
  // with new pages without having to regenerate (restart gatsby develop)
  if (modelName && config.overrideDev404 && page.path === '/dev-404-page/') {
    deletePage(page);
    createPage({
      ...page,
      component: config.templates[modelName],
    });
  }
};
