import { Builder } from '@builder.io/react';
import { EcomCollectionPicker, EcomCollectionPickerProps } from './editors/EcomCollectionPicker';
import {
  PickEcomCollectionsButton,
  PickEcomCollectionsListProps,
} from './editors/EcomCollectionList';
import { EcomProductPicker, EcomProductPickerProps } from './editors/EcomProductPicker';
import { PickEcomProductsButton, PickEcomProductsListProps } from './editors/EcomProductList';
import appState from '@builder.io/app-context';
import React from 'react';
import { onEditorLoad } from './actions/on-editor-load';

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
  onSave?: (actions: OnSaveActions) => Promise<void>; // you can run any action post save here, for example importing product data, registering webhooks
}

export interface CommerceAPIOperations {}

export const registerCommercePlugin = (
  config: CommercePluginConfig,
  apiOperations: CommerceAPIOperations
) => {
  Builder.register('app.onLoad', async ({ triggerSettingsDialog }: AppActions) => {
    const pluginSettings = appState.user.organization.value.settings.plugins.get(config.id);
    const hasConnected = pluginSettings.get('hasConnected');
    if (!hasConnected) {
      await triggerSettingsDialog(config.id);
    }
  });

  Builder.register('editor.onLoad', onEditorLoad(config, apiOperations));

  Builder.registerEditor({
    name: `${config.name}Product`,
    component: (props: EcomProductPickerProps) => (
      <EcomProductPicker
        {...props}
        pluginId={config.id}
        pluginName={config.name}
        api={apiOperations}
      />
    ),
  });

  Builder.registerEditor({
    name: `${config.name}ProductPreview`,
    component: (props: EcomProductPickerProps) => (
      <EcomProductPicker
        {...props}
        pluginId={config.id}
        pluginName={config.name}
        isPreview
        api={apiOperations}
      />
    ),
  });

  Builder.registerEditor({
    name: `${config.name}ProductHandle`,
    component: (props: EcomProductPickerProps) => (
      <EcomProductPicker
        {...props}
        pluginId={config.id}
        pluginName={config.name}
        handleOnly
        api={apiOperations}
      />
    ),
  });

  Builder.registerEditor({
    name: `${config.name}ProductList`,
    component: (props: PickEcomProductsListProps) => (
      <PickEcomProductsButton {...props} api={apiOperations} />
    ),
  });

  Builder.registerEditor({
    name: `${config.name}CollectionList`,
    component: (props: PickEcomCollectionsListProps) => (
      <PickEcomCollectionsButton {...props} api={apiOperations} />
    ),
  });

  Builder.registerEditor({
    name: `${config.name}Collection`,
    component: (props: EcomCollectionPickerProps) => (
      <EcomCollectionPicker
        {...props}
        pluginId={config.id}
        pluginName={config.name}
        api={apiOperations}
      />
    ),
  });

  Builder.registerEditor({
    name: `${config.name}CollectionPreview`,
    component: (props: EcomCollectionPickerProps) => (
      <EcomCollectionPicker {...props} pluginId={config.id} pluginName={config.name} isPreview />
    ),
  });

  Builder.registerEditor({
    name: `${config.name}CollectionHandle`,
    component: (props: EcomCollectionPickerProps) => (
      <EcomCollectionPicker {...props} pluginId={config.id} pluginName={config.name} handleOnly />
    ),
  });
};
