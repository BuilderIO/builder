"use strict";

exports.__esModule = true;
exports.createDataloaderLink = createDataloaderLink;

const DataLoader = require(`dataloader`);

const {
  ApolloLink,
  Observable
} = require(`@apollo/client`);

const {
  print
} = require(`gatsby/graphql`);

const {
  merge,
  resolveResult
} = require(`./merge-queries`);

function createDataloaderLink(options) {
  const load = async keys => {
    const query = merge(keys);
    const result = await request(query, options);

    if (!isValidGraphQLResult(result)) {
      const error = new Error(`Failed to load query batch:\n${formatErrors(result)}`);
      error.name = `GraphQLError`;
      error.originalResult = result;
      throw error;
    }

    return resolveResult(result);
  };

  const concurrency = Number(process.env.GATSBY_EXPERIMENTAL_QUERY_CONCURRENCY) || 4;
  const maxBatchSize = Math.min(4, Math.round(concurrency / 5));
  const dataloader = new DataLoader(load, Object.assign({
    cache: false,
    maxBatchSize,
    batchScheduleFn: callback => setTimeout(callback, 50)
  }, options.dataLoaderOptions));
  return new ApolloLink(operation => new Observable(observer => {
    const {
      query,
      variables
    } = operation;
    dataloader.load({
      query,
      variables
    }).then(response => {
      operation.setContext({
        response
      });
      observer.next(response);
      observer.complete();
      return response;
    }).catch(err => {
      if (err.name === `AbortError`) {
        return;
      }

      observer.error(err);
    });
  }));
}

function formatErrors(result) {
  var _result$errors;

  if ((result === null || result === void 0 ? void 0 : (_result$errors = result.errors) === null || _result$errors === void 0 ? void 0 : _result$errors.length) > 0) {
    return result.errors.map(error => {
      const {
        message,
        path = []
      } = error;
      return path.length > 0 ? `${message} (path: ${JSON.stringify(path)})` : message;
    }).join(`\n`);
  }

  return `Unexpected GraphQL result`;
}

function isValidGraphQLResult(response) {
  return response && response.data && (!response.errors || response.errors.length === 0);
}

async function request(query, options) {
  const {
    uri,
    headers = {},
    fetch,
    fetchOptions
  } = options;
  const body = JSON.stringify({
    query: print(query.query),
    variables: query.variables
  });
  const response = await fetch(uri, Object.assign({
    method: `POST`
  }, fetchOptions, {
    headers: Object.assign({
      "Content-Type": `application/json`
    }, headers),
    body
  }));
  return response.json();
}