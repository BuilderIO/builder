import { registerCommercePlugin } from '@builder.io/commerce-plugin-tools';
import { Resource } from '@builder.io/commerce-plugin-tools/dist/types/interfaces/resource';
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

    const transform = (resource: any) => ({
      ...resource,
      id: resource.id as any,
      title: resource.name || 'untitled',
      handle: resource.id,
      image: {
        src:
          resource.imageGroups?.[0].images?.[0].link ||
          'https://cdn.builder.io/api/v1/image/assets%2F979b06c19c1f41b0825d33993be6cdd4%2F478d9c03b7c24eaabbdb6346e67d5ed2',
      },
    });

    const transformCat = (cat: any) => ({
      id: cat.id,
      title: cat.name,
      handle: cat.id,
      image: {
        src: cat.image || 'https://unpkg.com/css.gg@2.0.0/icons/svg/box.svg',
      },
    });

    const service = {
      product: {
        async findById(id: string): Promise<Resource> {
          const product = await api.getProduct(id);
          return transform(product);
        },

        async search(search: string): Promise<Resource[]> {
          const searchResult = await api.search(search || 'womens');

          return (
            searchResult.hits?.map((hit: any) => ({
              id: hit.productId as any,
              title: hit.productName || 'untitled',
              handle: hit.productId,
              image: {
                src: hit.image?.link || 'https://unpkg.com/css.gg@2.0.0/icons/svg/toolbox.svg',
              },
            })) || []
          );
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
        async findById(id: string): Promise<Resource> {
          const cat = await api.getCategory(id);
          return transformCat(cat);
        },

        async search(search: string): Promise<Resource[]> {
          const categories = await api.searchCategories(search || '');

          return categories.map(transformCat);
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
    return service;
  }
);
