import { registerCommercePlugin, Resource } from '@builder.io/commerce-plugin-tools';
import pkg from '../package.json';
import appState from '@builder.io/app-context';
import { Api } from './api';
/**
 * 
parameters: {
    clientId: '1d763261-6522-4913-9d52-5d947d3b94c4',
    organizationId: 'f_ecom_zzte_053',
    shortCode: 'kv7kzm78',
    siteId: 'RefArch'
}
 */

registerCommercePlugin(
  {
    name: 'SFCommerce',
    id: pkg.name,
    settings: [
      {
        name: 'clientId',
        type: 'string',
        required: true,
      },
      {
        name: 'organizationId',
        type: 'string',
        required: true,
      },
      {
        name: 'proxy',
        type: 'string',
        required: true,
      },
      {
        name: 'shortCode',
        type: 'string',
        required: true,
      },
      {
        name: 'siteId',
        type: 'string',
        required: true,
      },
    ],
    ctaText: `Connect your Salesforce Commerce API`,
  },
  async () => {
    const api = new Api(appState.user.apiKey, pkg.name);
    return {
      product: {
        async findById(id: string) {
          return await api.getProduct(id);
        },
        async search(search: string) {
          return await api.search(search || 'womens');
        },
        getRequestObject(id: string) {
          return {
            '@type': '@builder.io/core:Request' as const,
            request: {
              url: api.getBaseUrl(`products/${id}`),
            },
            options: {
              product: id,
            },
          };
        },
      },

      category: {
        async findById(id: string) {
          return await api.getCategory(id);
        },
        async search(search: string) {
          return await api.searchCategories(search || '');
        },
        getRequestObject(id: string) {
          return {
            '@type': '@builder.io/core:Request' as const,
            request: {
              url: api.getBaseUrl(`categories/${id}`),
            },
            options: {
              category: id,
            },
          };
        },
      },
    };
  }
);
