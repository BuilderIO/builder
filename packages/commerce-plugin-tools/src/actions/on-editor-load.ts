import appState from '@builder.io/app-context';
import template from 'lodash.template';
import { CommerceAPIOperations } from '..';
import capitalize from 'lodash.capitalize';

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
export const onEditorLoad = (
  config: any,
  apiOperations: CommerceAPIOperations,
  resourceName: string
) => ({ safeReaction, updatePreviewUrl }: ContentEditorActions) => {
  // compile previewResource if any, to allow user to have templated editing urls for their models (e.g in cases of product page template)
  safeReaction(
    () => {
      const modelUrl = appState.designerState.editingModel?.examplePageUrl;
      if (!modelUrl) {
        return;
      }
      const previewField = appState.designerState.editingModel?.fields.find(
        (field: { type: string }) =>
          field.type === `${config.name}${capitalize(resourceName)}Preview`
      )?.name;
      if (previewField && appState.designerState.editingContentModel) {
        const resourceId = appState.designerState.editingContentModel.data
          .get(previewField)
          ?.options.get(resourceName);
        return apiOperations[resourceName].findById(resourceId);
      }
      const pluginSettings = appState.user.organization.value.settings.plugins.get(config.id);
      const shouldSync = pluginSettings.get('syncPreviewUrlWithTargeting');
      const query = appState.designerState.editingContentModel?.query?.toJSON();
      const customAttributes: Record<
        string,
        { type: string }
      > = appState.user.organization.value.customTargetingAttributes?.toJSON();
      if (shouldSync && customAttributes && query) {
        const apiService = apiOperations[resourceName];
        for (const [key, value] of Object.entries(customAttributes)) {
          const targetingValue = query.find((q: any) => q.property === key)?.value;
          if (targetingValue && value.type === `${config.name}${capitalize(resourceName)}`) {
            return apiService.findById(targetingValue);
          }
          if (
            apiService.findByHandle &&
            targetingValue &&
            value.type === `${config.name}${capitalize(resourceName)}Handle`
          ) {
            return apiService.findByHandle(targetingValue);
          }
        }
      }
    },
    async resourcePromise => {
      const modelUrl = appState.designerState.editingModel?.examplePageUrl;
      if (resourcePromise && modelUrl) {
        const previewResource = await resourcePromise;
        const compiled = template(modelUrl);
        const previewUrl = compiled(
          withDefaults({
            previewResource,
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
