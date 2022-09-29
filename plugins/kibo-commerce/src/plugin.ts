import { registerCommercePlugin } from '@builder.io/commerce-plugin-tools';
import pkg from '../package.json';
import { KiboClient } from '../utils/kibo-client';

registerCommercePlugin(
  {
    id: pkg.name,
    name: 'KiboCommerce',
    settings: [
      {
        name: 'apiHost',
        type: 'string',
        required: true,
      },
      {
        name: 'authHost',
        type: 'string',
        required: true,
      },
      {
        name: 'sharedSecret',
        type: 'string',
        required: true,
      },
      {
        name: 'clientId',
        type: 'string',
        required: true,
      },
    ],
    ctaText: `Connect your KiboCommerce store`,
  },
  settings => {
    const apiHost = settings.get('apiHost');
    const authHost = settings.get('authHost');
    const sharedSecret = settings.get('sharedSecret');
    const clientId = settings.get('clientId');

    const config = { apiHost, authHost, sharedSecret, clientId };
    const kiboClient = new KiboClient(config, {});
    const PAGE_SIZE = 16;

    const transformProduct = (resource: any) => ({
      ...resource,
      id: resource?.productCode,
      title: resource?.content?.productName,
      handle: resource?.productCode,
      image: {
        src: resource?.content?.productImages[0]?.imageUrl,
      },
    });

    const transformCategory = (resource: any) => ({
      ...resource,
      id: resource?.categoryCode,
      title: resource?.content?.name,
      handle: resource?.content?.slug,
      image: {
        src: resource?.content?.categoryImages[0]?.imageUrl,
      },
    });

    const service = {
      product: {
        async findById(productCode: string) {
          const products = await kiboClient.getItemsByProductCode([productCode]);
          return transformProduct(products[0]);
        },
        async search(searchTerm: string) {
          const searchOptions = {
            query: searchTerm ? `${searchTerm}` : '',
            startIndex: 0,
            pageSize: PAGE_SIZE,
          };
          const products = await kiboClient.performProductSearch(searchOptions);
          return products.items?.map(transformProduct);
        },
        getRequestObject(productCode: string) {
          return productCode;
        },
      },
      category: {
        async findById(categoryCode: string) {
          const categories = await kiboClient.getItemsByCategoryCode([categoryCode]);
          return transformCategory(categories[0]);
        },
        async search(searchTerm: string) {
          const searchOptions = {
            filter: searchTerm
              ? `content.name cont ${searchTerm} or categoryCode eq ${searchTerm}`
              : '',
          };

          const categories = await kiboClient.performCategorySearch(searchOptions);
          return categories.items?.map(transformCategory);
        },
        async findByHandle(handle: string) {
          const searchOptions = {
            filter: `content.slug eq ${handle}`,
          };
          const categories = await kiboClient.performCategorySearch(searchOptions);
          const category = categories?.items?.[0];
          return category && transformCategory(category);
        },

        getRequestObject(categoryCode: string) {
          return categoryCode;
        },
      },
    };

    return service;
  }
);
