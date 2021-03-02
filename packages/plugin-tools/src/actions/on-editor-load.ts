import appState from '@builder.io/app-context';
import template from 'lodash.template';

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
export const onEditorLoad = (config: any, apiOperations: any) => ({
  safeReaction,
  updatePreviewUrl,
}: ContentEditorActions) => {
  // compile previewProduct if any
  safeReaction(
    () => {
      const modelUrl = appState.designerState.editingModel?.examplePageUrl;
      if (!modelUrl) {
        return;
      }
      const previewField = appState.designerState.editingModel?.fields.find(
        (field: { type: string }) => field.type === `${config.name}ProductPreview`
      )?.name;
      if (previewField && appState.designerState.editingContentModel) {
        const productId = appState.designerState.editingContentModel.data
          .get(previewField)
          ?.options.get('product');
        return apiOperations.getProductByIdSync(productId);
      }
      const pluginSettings = appState.user.organization.value.settings.plugins.get(config.id);
      const shouldSync = pluginSettings.get('syncPreviewUrlWithTargeting');
      const query = appState.designerState.editingContentModel?.query?.toJSON();
      const customAttributes: Record<
        string,
        { type: string }
      > = appState.user.organization.value.customTargetingAttributes?.toJSON();
      if (shouldSync && customAttributes && query) {
        for (const [key, value] of Object.entries(customAttributes)) {
          const targetingValue = query.find((q: any) => q.property === key)?.value;
          if (targetingValue && value.type === `${config.name}Product`) {
            return apiOperations.getProductByIdSync(targetingValue);
          }
          if (targetingValue && value.type === `${config.name}ProductHandle`) {
            return apiOperations.getProductByHandleSync(targetingValue);
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
        (field: { type: string }) => field.type === `${config.name}CollectionPreview`
      )?.name;
      if (previewField && appState.designerState.editingContentModel) {
        const collectionId = appState.designerState.editingContentModel.data
          .get(previewField)
          ?.options.get('collection');
        return apiOperations.getCollectionByIdSync(collectionId);
      }
      const pluginSettings = appState.user.organization.value.settings.plugins.get(config.id);
      const shouldSync = pluginSettings.get('syncPreviewUrlWithTargeting');
      const query = appState.designerState.editingContentModel?.query?.toJSON();
      const customAttributes: Record<
        string,
        { type: string }
      > = appState.user.organization.value.customTargetingAttributes?.toJSON();
      if (shouldSync && customAttributes && query) {
        for (const [key, value] of Object.entries(customAttributes)) {
          const targetingValue = query.find((q: any) => q.property === key)?.value;
          if (targetingValue && value.type === `${config.name}Collection`) {
            return apiOperations.getCollectionByIdSync(targetingValue);
          }
          if (targetingValue && value.type === `${config.name}CollectionHandle`) {
            return apiOperations.getCollectionByHandleSync(targetingValue);
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
};

const withDefaults = (obj: any) => ({
  ...obj,
  space: {
    siteUrl: appState.user.organization.value?.siteUrl,
  },
});
