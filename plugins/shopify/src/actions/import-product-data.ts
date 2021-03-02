import { Builder } from '@builder.io/react';
import Client, { Shop } from 'shopify-buy';
import { pluginId } from '../constants';
import appState from '@builder.io/app-context';

const contentTemplate = (
  { products, ...resource }: any,
  resourceName: 'product' | 'collection'
) => ({
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
});
export const importCollections = async (modelName: string) => {
  const pluginSettings = appState.user.organization.value.settings.plugins.get(pluginId);
  const domain = pluginSettings.get('storeDomain');

  const client = Client.buildClient({
    // todo make sure plugin take storefrontAccessToken
    storefrontAccessToken: pluginSettings.get('storefrontAccessToken'),
    domain,
  });
  const pageSize = 20;
  let collections = await client.collection.fetchAll(pageSize);
  let hasMore = collections.length === pageSize;
  while (hasMore) {
    // ugh types don't match
    const more: { model?: any[] } = (await client.fetchNextPage(collections)) as any;
    hasMore = more.model?.length === pageSize;
    collections = collections.concat(more.model || []);
  }

  await Promise.all(
    collections.map(async collection => {
      const storefrontCollection = await client.collection.fetchByHandle(collection.handle);
      const content = contentTemplate(storefrontCollection, 'collection');
      await appState.createContent(modelName, content);
      appState.snackBar.show(`Created ${collection.title}`);
    })
  );

  appState.snackBar.show('Import done!');
};

export const importProducts = async (modelName: string) => {
  const domain = appState.user.organization.value.settings.plugins
    .get('@builder.io/plugin-shopify')
    .get('storeDomain');
  const client = Client.buildClient({
    // todo make sure plugin take storefrontAccessToken
    storefrontAccessToken: appState.user.organization.value.settings.plugins
      .get('@builder.io/plugin-shopify')
      .get('storefrontAccessToken'),
    domain,
  });
  const pageSize = 20;
  let productsResponse = await client.product.fetchAll(pageSize);
  let hasMore = productsResponse.length === pageSize;
  while (hasMore) {
    // ugh types don't match
    const more: { model?: ShopifyBuy.Product[] } = (await client.fetchNextPage(
      productsResponse
    )) as any;
    hasMore = more.model?.length === pageSize;
    productsResponse = productsResponse.concat(more.model || []);
  }
  await Promise.all(
    productsResponse.map(async (product: any) => {
      const fullProduct = await client.product.fetchByHandle(product.handle);
      const content = contentTemplate(fullProduct, 'product');
      await appState.createContent(modelName, content);
      appState.snackBar.show(`Created ${product.title}`);
    })
  );
  appState.snackBar.show('Import done!');
};

Builder.register('model.action', {
  name: 'Import product data',
  showIf(model: any) {
    return appState.user.can('admin') && ['data', 'page'].includes(model.kind);
  },
  async onClick(model: any) {
    if (
      !(await appState.dialogs.confirm(
        'This will import title, images, description, from your shopify product data into this model and create a published entry for each',
        'continue'
      ))
    ) {
      return;
    }
    appState.globalState.showGlobalBlockingLoadingIndicator = true;
    await importProducts(model.name);
    appState.globalState.showGlobalBlockingLoadingIndicator = false;
  },
});

Builder.register('model.action', {
  name: 'Import collection data',
  showIf(model: any) {
    return appState.user.can('admin') && ['data', 'page'].includes(model.kind);
  },
  async onClick(model: any) {
    if (
      !(await appState.dialogs.confirm(
        'This will import title, images, description, from your shopify product data into this model and create a published entry for each',
        'continue'
      ))
    ) {
      return;
    }
    appState.globalState.showGlobalBlockingLoadingIndicator = true;
    await importCollections(model.name);
    appState.globalState.showGlobalBlockingLoadingIndicator = false;
  },
});
