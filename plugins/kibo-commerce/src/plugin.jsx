import { registerCommercePlugin } from '@builder.io/commerce-plugin-tools';
import pkg from '../package.json';
import { KiboCommerce } from '../utils/kibocommerce';

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
    const kiboClient = new KiboCommerce(config, {});
    const PAGE_SIZE = 16;

    const transformResource = resource => ({
      ...resource,
      id: resource?.productCode,
      title: resource?.content?.productName,
      handle: resource?.productCode,
      image: {
        src: resource?.content?.productImages[0]?.imageUrl,
      },
    });

    const service = {
      product: {
        async findById(productCode) {
          const products = await kiboClient.getItemsByProductCode(PAGE_SIZE, [productCode]);
          const transformedProduct = transformResource(products[0]);

          return transformedProduct;
        },

        async search(searchTerm) {
          const searchOptions = {
            query: searchTerm,
            filter: '',
            pageSize: PAGE_SIZE,
            startIndex: 1,
          };

          let products = await kiboClient.performSearch(searchOptions);
          const transformedProducts = products.items?.map(transformResource);

          return transformedProducts;
        },

        getRequestObject(productCode) {
          return {
            '@type': '@builder.io/core:Request',
            request: {
              url: `https://api.kibocommerce.com/products/${productCode}`,
            },
            options: {
              product: productCode,
            },
          };
        },
      },
      category: {
        async findById(productCode) {
          const products = await kiboClient.getItemsByProductCode(PAGE_SIZE, [productCode]);
          const transformedProduct = transformResource(products[0]);

          return transformedProduct;
        },

        async search(searchTerm) {
          const searchOptions = {
            query: searchTerm,
            filter: '',
            pageSize: PAGE_SIZE,
            startIndex: 1,
          };

          let categories = await kiboClient.performSearch(searchOptions);
          const transformedCategories = categories.items?.map(transformResource);

          return transformedCategories;
        },

        getRequestObject(categoryCode) {
          return {
            '@type': '@builder.io/core:Request',
            request: {
              url: `https://api.kibocommerce.com/category/${categoryCode}`,
            },
            options: {
              category: categoryCode,
            },
          };
        },
      },
    };

    return service;
  }
);
