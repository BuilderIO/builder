import { registerCommercePlugin } from '@builder.io/commerce-plugin-tools';
import { Resource } from '@builder.io/commerce-plugin-tools/dist/types/interfaces/resource';

registerCommercePlugin(
  {
    name: 'ShopifyStore',
    // should always match package.json package name
    id: '@builder.io/plugin-shopify-demo',
    settings: [
      {
        name: 'shopUrl',
        type: 'string',
        required: true,
        helperText: 'The url of your shopify store',
      },
    ],
    ctaText: `Connect your Shopify store`,
  },
  settings => {
    const basicCache = new Map();

    const baseUrl = settings.get('shopUrl');

    const transformResource = (resource: any) => ({
      ...resource,
      ...(resource.images && {
        image: {
          src: resource.images[0]?.src,
        },
      }),
    });

    return {
      collection: {
        async findById(id: string) {
          const key = `${id}collectionById`;
          const collections = await this.search('');
          const collection = collections.find(collectionObj => String(collectionObj.id) === id);
          basicCache.set(key, collection);
          return collection!;
        },
        async findByHandle(handle: string) {
          const key = `${handle}collectionByHandle`;
          const response =
            basicCache.get(key) ||
            (await fetch(`${baseUrl}/collections/${handle}.json`).then(res => res.json()));
          basicCache.set(key, response);
          return transformResource(response.collection);
        },
        async search(search: string) {
          const key = `allCollections`;
          const response =
            basicCache.get(key) ||
            (await fetch(`${baseUrl}/collections.json`).then(res => res.json()));
          basicCache.set(key, response);
          const collections = response.collections || [];
          if (search) {
            return collections
              .filter((collection: Resource) =>
                collection.title.toLowerCase().includes(search.toLowerCase())
              )
              .map(transformResource);
          }
          return collections.map(transformResource);
        },
        getRequestObject(_id: string, collection: Resource) {
          return {
            '@type': '@builder.io/core:Request',
            request: {
              url: `${baseUrl}/collections/${collection.handle}.json`,
            },
            options: {
              collection: collection.id,
            },
          };
        },
      },
      product: {
        async findById(id: string) {
          const key = `${id}productById`;
          const products = await this.search('');
          const product = products.find(productObj => String(productObj.id) === id);
          basicCache.set(key, product);
          return product!;
        },
        async findByHandle(handle: string) {
          const key = `${handle}productByHandle`;
          const response =
            basicCache.get(key) ||
            (await fetch(`${baseUrl}/products/${handle}.json`).then(res => res.json()));
          basicCache.set(key, response);
          return transformResource(response.product);
        },
        async search(search: string) {
          const key = `allProducts`;
          const response =
            basicCache.get(key) ||
            (await fetch(`${baseUrl}/products.json`).then(res => res.json()));
          basicCache.set(key, response);
          const products = response.products || [];
          if (search) {
            return products
              .filter((product: Resource) =>
                product.title.toLowerCase().includes(search.toLowerCase())
              )
              .map(transformResource);
          }
          return products.map(transformResource);
        },
        getRequestObject(_id: string, product: Resource) {
          return {
            '@type': '@builder.io/core:Request',
            request: {
              url: `${baseUrl}/products/${product.handle}.json`,
            },
            options: {
              product: product.id,
            },
          };
        },
      },
    };
  }
);
