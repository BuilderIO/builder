import { registerCommercePlugin } from '@builder.io/commerce-plugin-tools';
import { Resource } from '@builder.io/commerce-plugin-tools/dist/types/interfaces/resource';
import appState from '@builder.io/app-context';

interface Model {
  name: string;
  hideFromUI?: boolean;
  kind: 'data' | 'page' | 'component' | 'function';
}

const shopifyModels: Model[] = [
  {
    name: 'shopify-product',
    kind: 'data',
    hideFromUI: true,
  },
  {
    name: 'shopify-collection',
    kind: 'data',
    hideFromUI: true,
  },
];
const pluginId = '@builder.io/plugin-shopify-demo';

registerCommercePlugin(
  {
    name: 'ShopifyStore',
    // should always match package.json package name
    id: pluginId,
    settings: [
      {
        name: 'shopUrl',
        type: 'string',
        required: true,
        helperText: 'The url of your shopify store',
      },
      {
        name: 'syncPreviewUrlWithTargeting',
        type: 'boolean',
        defaultValue: true,
      },
    ],
    ctaText: `Connect your Shopify store`,
    async onSave(actions) {
      const confirm = await appState.dialogs.confirm(
        'Would you like to index your products and collections from shopify?'
      );
      if (confirm) {
        //TODO: create targeting attributes, productHandle: ShopifyProductHandle , collectionHandle: ShopifyCollectionHandle

        // create required models
        const promises = shopifyModels
          .filter(model => {
            return !appState.models.result.find((m: Model) => m.name === model.name);
          })
          .map(model => actions.addModel(model));
        await Promise.all(promises);

        // import and register webhooks
        appState.globalState.showGlobalBlockingLoadingIndicator = true;
        try {
          const productImported = await importResources('shopify-product', 'product');
          await importResources('shopify-collection', 'collection', async collection => {
            const baseUrl = appState.user.organization.value.settings.plugins
              .get(pluginId)
              .get('shopUrl');
            const { products } = await fetch(
              `${baseUrl}/collections/${collection.handle}/products.json`
            ).then(res => res.json());
            await Promise.all(
              products.map(async (product: any) => {
                if (!productImported[product.id]) {
                  const content = contentTemplate(product, 'product');
                  productImported[product.id] = true;
                  await appState.createContent('shopify-product', content);
                }
              })
            );
            return {
              ...collection,
              products,
            };
          });
        } catch (e) {
          console.error(e);
          appState.dialogs.alert(
            'If this problem persists, please contact help@builder.io',
            'Uh oh! An error occured :('
          );
        }
        appState.globalState.showGlobalBlockingLoadingIndicator = false;
      }
    },
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
          const collection = collections.find(
            collectionObj => String(collectionObj.id) === String(id)
          );
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
          const product = products.find(productObj => String(productObj.id) === String(id));
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
function contentTemplate(resource: any, resourceName: 'product' | 'collection') {
  return {
    published: 'published',
    name: resource.title,
    meta: {
      importedDate: Date.now(),
      addedBy: pluginId,
    },
    data: {
      ...resource,
    },
    query: [
      {
        property: `${resourceName}Handle`,
        value: resource.handle,
        operator: 'is',
      },
    ],
  };
}

async function importResources(
  modelName: string,
  resource: 'product' | 'collection',
  extendResource?: (resouce: any) => Promise<any>
) {
  const baseUrl = appState.user.organization.value.settings.plugins.get(pluginId).get('shopUrl');

  const response = await fetch(`${baseUrl}/${resource}s.json`).then(res => res.json());
  const resources = response[`${resource}s`] || [];
  let imported = {} as Record<string, boolean>;
  await Promise.all(
    resources.map(async (obj: any) => {
      let data = obj;
      if (extendResource) {
        data = await extendResource(obj);
      }
      imported[obj.id] = true;
      const content = contentTemplate(data, resource);
      await appState.createContent(modelName, content);
      appState.snackBar.show(`Imported ${resource}: ${obj.title}`);
    })
  );

  appState.snackBar.show('Import done!');
  return imported;
}
