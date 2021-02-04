import { Builder } from '@builder.io/react';
export * from './editors/ShopifyCollectionPicker';
export * from './editors/ShopifyCollectionList';
export * from './editors/ShopifyProductPicker';
export * from './editors/ShopifyProductList';
import './actions/on-editor-load';
import { importProducts, importCollections } from './actions/import-product-data';
import appState from '@builder.io/app-context';

import { pluginId } from './constants';
import { createWebhooks } from './actions/create-webhooks';

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

Builder.register('plugin', {
  id: pluginId,
  name: 'Shopify',
  settings: [
    // {
    //   name: 'hasConnected',
    //   type: 'boolean',
    //   hideFromUI: true,
    // },
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
      helperText: 'fill in product/collection information from targeting in the preview url',
    },
  ],

  ctaText: 'Connect your store',

  async onSave(actions: OnSaveActions) {
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
        await importProducts('shopify-product');
        await createWebhooks('product', 'shopify-product');
        await importCollections('shopify-collection');
        await createWebhooks('collection', 'shopify-collection');
      } catch (e) {
        console.error(e);
        appState.dialogs.alert(
          'If this problem persists, please contact help@builder.io',
          'Uh oh! An error occured :('
        );
      }
      appState.globalState.showGlobalBlockingLoadingIndicator = false;
    }
    // update plugin setting
    await actions.updateSettings({
      hasConnected: true,
    });
  },
});

// todo move to sdk
interface OnSaveActions {
  updateSettings(partal: Record<string, any>): Promise<void>;
  addModel(model: Model): Promise<void>;
}

interface AppActions {
  triggerSettingsDialog(pluginId: string): Promise<void>;
}
interface Model {
  name: string;
  hideFromUI?: boolean;
  kind: 'data' | 'page' | 'component' | 'function';
}

Builder.register('app.onLoad', async ({ triggerSettingsDialog }: AppActions) => {
  const pluginSettings = appState.user.organization.value.settings.plugins.get(pluginId);
  const hasConnected = pluginSettings.get('hasConnected');
  if (!hasConnected) {
    await triggerSettingsDialog(pluginId);
  }
});
