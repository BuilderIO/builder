import { registerCommercePlugin } from '@builder.io/commerce-plugin-tools';
import Commerce from '@chec/commerce.js';
import pkg from '../package.json';
// Define Commerce.js plugin ID. ID string should match package name.
const pluginId = pkg.name;

// Commerce.js Builder.io plugin for integrating products, categories and merchant
// data from your Chec store
registerCommercePlugin(
  {
    id: pluginId,
    name: 'Commercejs',
    settings: [
      // List of data input to connect store
      {
        name: 'publicKey',
        type: 'string',
        required: true,
        helperText:
          'Get your public API key from your Chec dashboard (Developer > API keys in https://dashboard.chec.io/settings/developer)',
      },
    ],
    ctaText: `Connect your Commerce.js store`,
  },
  // Observable map of the settings configured above
  settings => {
    // Get public key input from user
    const publicKey = settings.get('publicKey')?.trim();
    // Initialize Commerce with the public API key
    const commerce = new Commerce(publicKey, false);

    // Transform product to match Resource interface
    const transformProduct = (product: any) => ({
      id: product.id,
      title: product.name,
      handle: product.permalink,
      image: product.media?.source,
    });

    // Transform category to match Resource interface
    const transformCategory = (category: any) => ({
      id: category.id,
      title: category.name,
      handle: category.slug,
    });

    return {
      product: {
        async findById(id: string) {
          const productResponse = await commerce.products.retrieve(id);
          return transformProduct(productResponse);
        },
        async findByHandle(handle: string) {
          const productResponse = await commerce.products.retrieve(handle, { type: 'permalink' });
          return transformProduct(productResponse);
        },
        async search(search: string) {
          const response = await commerce.products.list({
            search,
            limit: 200,
            page: 1,
          });
          return response.data.map(transformProduct);
        },

        getRequestObject(id: string) {
          return {
            '@type': '@builder.io/core:Request',
            request: {
              url: `https://api.chec.io/v1/products/${id}`,
            },
            options: {
              product: id,
            },
          };
        },
      },
      category: {
        async findById(id: string) {
          const categoryResponse = await commerce.categories.retrieve(id);
          return transformCategory(categoryResponse);
        },
        async findByHandle(handle: string) {
          const categoryResponse = await commerce.categories.retrieve(handle, { type: 'slug' });
          return transformCategory(categoryResponse);
        },
        async search(search: string) {
          const response = await commerce.categories.list({
            search,
            limit: 200,
            page: 1,
          });
          return response.data.map(transformCategory);
        },

        getRequestObject(id: string) {
          return {
            '@type': '@builder.io/core:Request',
            request: {
              url: `https://api.chec.io/v1/categories/${id}`,
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
