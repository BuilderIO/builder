import { registerCommercePlugin } from '@builder.io/commerce-plugin-tools';

import Client from 'shopify-buy';
import pkg from '../package.json';
import appState from '@builder.io/app-context';
import { getDataConfig } from './data-plugin';

registerCommercePlugin(
  {
    name: 'Shopify',
    // should always match package.json package name
    id: pkg.name,
    settings: [
      {
        name: 'storefrontAccessToken',
        type: 'string',
        helperText:
          'Required to sync, index, and cache your storefront product data to avoid rate limits',
        required: true,
      },
      {
        name: 'storeDomain',
        type: 'text',
        helperText: 'Your entire store domain, such as "your-store.myshopify.com"',
        required: true,
      },
    ],
    ctaText: `Connect your shopify custom app`,
  },
  async settings => {
    const client = Client.buildClient({
      storefrontAccessToken: settings.get('storefrontAccessToken'),
      domain: settings.get('storeDomain'),
    });

    const service = {
      product: {
        async findById(id: string) {
          return client.product.fetch(id);
        },
        async findByHandle(handle: string) {
          return client.product.fetchByHandle(handle);
        },
        async search(search: string) {
          return client.product.fetchQuery({
            query: search ? `title:*${search}*` : '',
            sortKey: 'TITLE',
          });
        },

        getRequestObject(id: string) {
          return {
            '@type': '@builder.io/core:Request' as const,
            request: {
              url: `${appState.config.apiRoot()}/api/v1/shopify/storefront/product/${id}?apiKey=${
                appState.user.apiKey
              }&pluginId=${pkg.name}`,
            },
            options: {
              product: id,
            },
          };
        },
      },
      collection: {
        async findById(id: string) {
          return client.collection.fetch(id);
        },
        async findByHandle(handle: string) {
          return client.collection.fetchByHandle(handle);
        },
        async search(search: string) {
          return client.collection.fetchQuery({
            query: search ? `title:*${search}*` : '',
            sortKey: 'TITLE',
          });
        },

        getRequestObject(id: string) {
          return {
            '@type': '@builder.io/core:Request' as const,
            request: {
              url: `${appState.config.apiRoot()}/api/v1/shopify/storefront/collection/${id}?apiKey=${
                appState.user.apiKey
              }&pluginId=${pkg.name}`,
            },
            options: {
              collection: id,
            },
          };
        },
      },
    };

    appState.registerDataPlugin(getDataConfig(service));

    return service;
  }
);
