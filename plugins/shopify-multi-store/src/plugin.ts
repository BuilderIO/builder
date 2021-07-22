import { registerCommercePlugin } from '@builder.io/commerce-plugin-tools';
import pkg from '../package.json';
import { buildClient } from 'shopify-buy';
import { camelCase } from 'lodash';
import appState from '@builder.io/app-context';

const transformResource = (resource: any) => ({
  ...resource,
  image: resource.image || resource.images?.[0],
});

registerCommercePlugin(
  {
    name: 'HeadlessShopify',
    id: pkg.name,
    settings: [
      {
        name: 'stores',
        type: 'list',
        subFields: [
          {
            name: 'name',
            type: 'text',
            helperText:
              'must be unique accross stores, do not change name if you have published content using it',
            required: true,
          },
          {
            type: 'object',
            name: 'config',
            required: true,
            subFields: [
              {
                name: 'apiKey',
                type: 'string',
                required: true,
                helperText:
                  'Get your API key and password here: https://shopify.dev/tutorials/authenticate-a-private-app-with-shopify-admin',
              },
              {
                name: 'storefrontAccessToken',
                type: 'string',
                helperText:
                  'Required to sync, index, and cache your storefront product data to avoid rate limits',
                required: true,
              },
              {
                name: 'language',
                type: 'string',
              },
              {
                name: 'apiPassword',
                type: 'password',
                required: true,
                helperText:
                  'Get your API key and password here: https://shopify.dev/tutorials/authenticate-a-private-app-with-shopify-admin',
              },
              {
                name: 'storeDomain',
                type: 'text',
                helperText: 'your-store.myshopify.com',
                required: true,
              },
              {
                name: 'syncPreviewUrlWithTargeting',
                type: 'boolean',
                defaultValue: true,
                helperText:
                  'fill in product/collection information from targeting in the preview url',
              },
            ],
          },
        ],
      },
    ],
    ctaText: `Connect your Shopify stores`,
  },
  settings => {
    if (settings.get('stores')) {
      const stores: any[] = JSON.parse(JSON.stringify(settings.get('stores')));

      const config = stores.reduce((acc, store) => {
        const client = buildClient({
          storefrontAccessToken: store.config.storefrontAccessToken,
          domain: store.config.storeDomain,
          language: store.config.language || 'english',
        });
        return {
          ...acc,
          [`${camelCase(store.name)} Product`]: {
            async findById(id: string) {
              return transformResource(await client.product.fetch(id));
            },
            async findByHandle(handle: string) {
              return transformResource(await client.product.fetchByHandle(handle));
            },
            async search(search: string) {
              return (
                await client.product.fetchQuery({
                  query: search ? `title:*${search}*` : '',
                  sortBy: 'title',
                })
              ).map(transformResource);
            },
            // TODO: add request on shopify proxy accounts for multi stores
            getRequestObject(productId: string) {
              return {
                '@type': '@builder.io/core:Request',
                request: {
                  url: `${appState.config.apiRoot()}/api/v1/shopify/products/${productId}.json?apiKey=${
                    appState.user.apiKey
                  }&storeName=${store.name}`,
                },
                options: {
                  collection: productId,
                },
              };
            },
          },
          [`${store.name} Collection`]: {
            async findById(id: string) {
              return transformResource(await client.collection.fetch(id));
            },
            async findByHandle(handle: string) {
              return transformResource(await client.collection.fetchByHandle(handle));
            },
            async search(search: string) {
              return (
                await client.collection.fetchQuery({
                  query: search ? `title:*${search}*` : '',
                  sortBy: 'title',
                })
              ).map(transformResource);
            },
            // TODO: add request on shopify proxy accounts for multi stores
            getRequestObject(collectionId: string) {
              return {
                '@type': '@builder.io/core:Request',
                request: {
                  url: `${appState.config.apiRoot()}/api/v1/shopify/collections/${collectionId}.json?apiKey=${
                    appState.user.apiKey
                  }&storeName=${store.name}`,
                },
                options: {
                  collection: collectionId,
                },
              };
            },
          },
        };
      }, {});

      const storeWithIds = stores.map(store => {
        return {
          ...store,
          id: camelCase(store.name),
          title: store.name,
        };
      });
      config.store = {
        findById(id: string) {
          return Promise.resolve(storeWithIds.find(store => store.id === id));
        },
        search() {
          return Promise.resolve(storeWithIds);
        },
        getRequestObject(id: string) {
          return {
            options: {
              store: id,
            },
          };
        },
      };

      return config;
    }
    return {};
  }
);
