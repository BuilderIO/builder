import { Builder } from '@builder.io/sdk';
import { Input } from '@builder.io/sdk';
import appState from '@builder.io/app-context';
import { ReactNode } from 'react';

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

export type ResourceType = {
  name: string;
  id: string;
  icon?: string;
  description?: string;
  inputs?: () => Partial<Input>[];
  toUrl: (options: Record<string, any>) => string | Promise<string>;
  canPickEntries?: boolean;
};

export type GetResourceTypes = () => Promise<ResourceType[]>;

export interface DataPluginOptions {
  id: string; // match npm package name @builder.io/plugin-shopify,
  name: string; // single word will prefix types with it, e.g Shopify
  settings: any[]; // list of setting commerce API needs to communicate, e.g storeFrontAccessToken
  ctaText: string; // what to display on the button to save settings, e.g `Connect your store`
  onSave?: (actions: OnSaveActions) => Promise<void>; // you can run any action post save here, for example importing ${capitalize(resourceName)} data, registering webhooks
  icon?: string;
  noResourceTypesFoundMessage?: string | ReactNode;
}

export type ResourceEntryType = {
  id: string;
  name: string;
  icon?: string;
  description?: string;
};

export type GetEntriesByResourceType = (
  resourceTypeId: string,
  options?: { searchText?: string; resourceEntryId?: string }
) => Promise<ResourceEntryType[]>;

export type APIOperations = {
  getResourceTypes: GetResourceTypes;
  getEntriesByResourceType?: GetEntriesByResourceType;
};

export const registerDataPlugin = async (
  config: DataPluginOptions,
  apiOperationsFromSettings: (settings: any) => APIOperations | Promise<APIOperations>
) => {
  const registerEditors = async () => {
    const savedSettings = appState.user.organization.value.settings.plugins.get(config.id);
    const allSettings = {
      ...config,
      ...(await apiOperationsFromSettings(savedSettings)),
    };
    appState.registerDataPlugin(allSettings);
  };

  const onSave = config.onSave;
  config.onSave = async actions => {
    await actions.updateSettings({ hasConnected: true });
    if (onSave) {
      await onSave(actions);
    }
    registerEditors();
  };

  Builder.register('plugin', { ...config, isDataPlugin: true });

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
