import { Builder } from '@builder.io/sdk';
import {
  CommerceAPIOperations,
  ResourcesPickerButton,
  ResourcesPickerButtonProps,
} from './editors/ResourcesPicker';
import { PickResourcesListButton, PickResourceListProps } from './editors/ResourcesList';
import appState from '@builder.io/app-context';
import React from 'react';
import { onEditorLoad } from './actions/on-editor-load';
import { ErrorBoundary } from './components/error-boundary';
import capitalize from 'lodash/capitalize';
import pluralize from 'pluralize';
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

export interface CommercePluginConfig {
  id: string; // match npm package name @builder.io/plugin-shopify,
  name: string; // single word will prefix types with it, e.g Shopify
  settings: any[]; // list of setting commerce API needs to communicate, e.g storeFrontAccessToken
  ctaText: string; // what to display on the button to save settings, e.g `Connect your store`
  onSave?: (actions: OnSaveActions) => Promise<void>; // you can run any action post save here, for example importing ${capitalize(resourceName)} data, registering webhooks
  noPreviewTypes?: boolean;
}

export const registerCommercePlugin = async (
  config: CommercePluginConfig,
  apiOperationsFromSettings: (
    settings: any
  ) => CommerceAPIOperations | Promise<CommerceAPIOperations>
) => {
  const registerEditors = async () => {
    const apiOperations = await apiOperationsFromSettings(
      appState.user.organization.value.settings.plugins.get(config.id)
    );

    const resources = Object.keys(apiOperations);

    resources.forEach(resourceName => {
      const contextProps = {
        resourceName,
        pluginId: config.id,
        plulginName: config.name,
        api: apiOperations,
      };
      Builder.register('editor.onLoad', onEditorLoad(config, apiOperations, resourceName));
      const resourcePicker = apiOperations[resourceName].resourcePicker;
      Builder.registerEditor({
        name: `${config.name}${capitalize(resourceName)}`,
        isDataResource: true,
        pluginId: config.id,
        component: (props: ResourcesPickerButtonProps) => (
          <ErrorBoundary>
            <ResourcesPickerButton resourcePicker={resourcePicker} {...props} {...contextProps} />
          </ErrorBoundary>
        ),
      });

      if (!config.noPreviewTypes) {
        Builder.registerEditor({
          name: `${config.name}${capitalize(resourceName)}Preview`,
          component: (props: ResourcesPickerButtonProps) => (
            <ErrorBoundary>
              <ResourcesPickerButton
                resourcePicker={resourcePicker}
                {...props}
                {...contextProps}
                previewType={`${config.name}${capitalize(resourceName)}Preview`}
                isPreview
              />
            </ErrorBoundary>
          ),
        });
      }

      if (apiOperations[resourceName].findByHandle) {
        Builder.registerEditor({
          name: `${config.name}${capitalize(resourceName)}Handle`,
          component: (props: ResourcesPickerButtonProps) => (
            <ErrorBoundary>
              <ResourcesPickerButton
                resourcePicker={resourcePicker}
                {...props}
                {...contextProps}
                handleOnly
              />
            </ErrorBoundary>
          ),
        });
      }

      Builder.registerEditor({
        name: `${config.name}${capitalize(pluralize.plural(resourceName))}List`,
        enum: true,
        component: (props: PickResourceListProps) => (
          <ErrorBoundary>
            <PickResourcesListButton resourcePicker={resourcePicker} {...props} {...contextProps} />
          </ErrorBoundary>
        ),
      });
    });
  };
  const onSave = config.onSave;
  config.onSave = async actions => {
    await actions.updateSettings({ hasConnected: true });
    if (onSave) {
      await onSave(actions);
    }
    registerEditors();
  };

  Builder.register('plugin', { ...config, isSourcePlugin: true });

  Builder.register('app.onLoad', async ({ triggerSettingsDialog }: AppActions) => {
    const pluginSettings = appState.user.organization.value.settings.plugins.get(config.id);
    const hasConnected = pluginSettings?.get('hasConnected');
    if (!hasConnected) {
      await triggerSettingsDialog(config.id);
    }
  });

  const savedSettings = appState.user.organization.value.settings.plugins.get(config.id);
  if (!savedSettings) {
    return;
  }

  await registerEditors();
};

export { Resource } from './interfaces/resource';
export { BuilderRequest } from './interfaces/builder-request';
export {
  ResourcePreviewCell,
  ResourcePickerProps,
  ResourcePreviewCellProps,
  CommerceAPIOperations,
} from './editors/ResourcesPicker';
