import { Builder } from '@builder.io/react';
import appState from '@builder.io/app-context';
import template from 'lodash.template';
import { pluginId } from '../constants';

interface ContentEditorActions {
  updatePreviewUrl: (url: string) => void;
  safeReaction<T>(
    watchFunction: () => T,
    reactionFunction: (arg: T) => void,
    options?: {
      fireImmediately: true;
    }
  ): void;
}

Builder.register('editor.onLoad', ({ safeReaction, updatePreviewUrl }: ContentEditorActions) => {
  // compile previewProduct if any
  safeReaction(
    () => {
      const modelUrl = appState.designerState.editingModel?.examplePageUrl;
      if (!modelUrl) {
        return;
      }
      const previewField = appState.designerState.editingModel?.fields.find(
        (field: { type: string }) => field.type === 'ShopifyProductPreview'
      )?.name;
      if (previewField && appState.designerState.editingContentModel) {
        const productId = appState.designerState.editingContentModel.data
          .get(previewField)
          ?.options.get('product');
        const response = appState.httpCache.get(
          `${appState.config.apiRoot()}/api/v1/shopify/products/${productId}.json?apiKey=${
            appState.user.apiKey
          }`
        );
        return response?.value?.product;
      }
      const pluginSettings = appState.user.organization.value.settings.plugins.get(pluginId);
      const shouldSync = pluginSettings.get('syncPreviewUrlWithTargeting');
      const query = appState.designerState.editingContentModel?.query?.toJSON();
      const customAttributes: Record<
        string,
        { type: string }
      > = appState.user.organization.value.customTargetingAttributes?.toJSON();
      if (shouldSync && customAttributes && query) {
        for (const [key, value] of Object.entries(customAttributes)) {
          const targetingValue = query.find((q: any) => q.property === key)?.value;
          if (targetingValue && value.type === 'ShopifyProduct') {
            const response = appState.httpCache.get(
              `${appState.config.apiRoot()}/api/v1/shopify/products/${targetingValue}.json?apiKey=${
                appState.user.apiKey
              }`
            );
            return response?.value?.product;
          }
          if (targetingValue && value.type === 'ShopifyProductHandle') {
            const response = appState.httpCache.get(
              `${appState.config.apiRoot()}/api/v1/shopify/products.json?handle=${targetingValue}&apiKey=${
                appState.user.apiKey
              }`
            );
            return response?.value?.products?.[0];
          }
        }
      }
    },
    async productObject => {
      const modelUrl = appState.designerState.editingModel?.examplePageUrl;
      if (productObject && modelUrl) {
        const compiled = template(modelUrl);
        const previewUrl = compiled(
          withDefaults({
            previewProduct: productObject,
          })
        );
        if (modelUrl !== previewUrl) {
          updatePreviewUrl(previewUrl);
          appState.snackBar.show(`Previewing ${previewUrl}`);
        }
      }
    }
  );
  // compile preview collection
  safeReaction(
    () => {
      const modelUrl = appState.designerState.editingModel?.examplePageUrl;
      if (!modelUrl) {
        return;
      }
      const previewField = appState.designerState.editingModel?.fields.find(
        (field: { type: string }) => field.type === 'ShopifyCollectionPreview'
      )?.name;
      if (previewField && appState.designerState.editingContentModel) {
        const collectionId = appState.designerState.editingContentModel.data
          .get(previewField)
          ?.options.get('collection');
        const response = appState.httpCache.get(
          `${appState.config.apiRoot()}/api/v1/shopify/collections/${collectionId}.json?apiKey=${
            appState.user.apiKey
          }`
        );
        return response?.value?.collection;
      }
      const pluginSettings = appState.user.organization.value.settings.plugins.get(pluginId);
      const shouldSync = pluginSettings.get('syncPreviewUrlWithTargeting');
      const query = appState.designerState.editingContentModel?.query?.toJSON();
      const customAttributes: Record<
        string,
        { type: string }
      > = appState.user.organization.value.customTargetingAttributes?.toJSON();
      if (shouldSync && customAttributes && query) {
        for (const [key, value] of Object.entries(customAttributes)) {
          const targetingValue = query.find((q: any) => q.property === key)?.value;
          if (targetingValue && value.type === 'ShopifyCollection') {
            const response = appState.httpCache.get(
              `${appState.config.apiRoot()}/api/v1/shopify/collections/${targetingValue}.json?apiKey=${
                appState.user.apiKey
              }`
            );
            return response?.value?.collection;
          }
          if (targetingValue && value.type === 'ShopifyCollectionHandle') {
            const response = appState.httpCache.get(
              `${appState.config.apiRoot()}/api/v1/shopify/search/collection?search=${targetingValue}&apiKey=${
                appState.user.apiKey
              }`
            );
            return response?.value?.collections?.[0];
          }
        }
      }
    },
    async collectionObj => {
      const modelUrl = appState.designerState.editingModel?.examplePageUrl;
      if (collectionObj && modelUrl) {
        const compiled = template(modelUrl);
        const previewUrl = compiled(
          withDefaults({
            previewCollection: collectionObj,
          })
        );
        if (modelUrl !== previewUrl) {
          updatePreviewUrl(previewUrl);
          appState.snackBar.show(`Previewing ${previewUrl}`);
        }
      }
    }
  );
});

const withDefaults = (obj: any) => ({
  ...obj,
  space: {
    siteUrl: appState.user.organization.value?.siteUrl,
  },
});
