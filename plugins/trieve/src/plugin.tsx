import { Builder } from '@builder.io/react';
import { createWebhook } from './createWebhooks';
import appState from '@builder.io/app-context';
import { pluginId } from './pluginId';

interface OnSaveActions {
  updateSettings(partal: Record<string, any>): Promise<void>;
}

Builder.register('plugin', {
  name: 'Trieve',
  id: pluginId,
  settings: [
    {
      name: 'trieveApiKey',
      type: 'text',
      defaultValue: true,
      friendlyName: 'Trieve API Key',
    },
    {
      name: 'trieveBaseUrl',
      type: 'text',
      defaultValue: true,
      friendlyName: 'Trieve Base URL',
    },
  ],

  ctaText: 'Save',

  async onSave(actions: OnSaveActions) {
    // update plugin setting
    await actions.updateSettings({
      hasConnected: true,
    });

    // @ts-ignore
    appState.dialogs.alert('Plugin settings saved.');
  },
});

interface AppActions {
  triggerSettingsDialog(pluginId: string): Promise<void>;
}

Builder.register('app.onLoad', async ({ triggerSettingsDialog }: AppActions) => {
  const pluginSettings =
    // @ts-ignore
    appState.user.organization.value.settings.plugins?.get(pluginId);
  const hasConnected = pluginSettings?.get('hasConnected');
  if (!hasConnected) {
    await triggerSettingsDialog(pluginId);
  }
});

Builder.register('model.action', {
  name: 'Sync to Trieve',
  showIf() {
    // @ts-ignore
    return appState.user.can('admin');
  },
  async onClick(model: any) {
    // @ts-ignore
    const datasetId = await appState.dialogs.prompt({
      title: 'Enter Dataset ID',
      message: 'Please enter the dataset ID:',
      friendlyName: 'Dataset ID',
      placeholder: 'Enter dataset ID',
      defaultValue: '',
    });

    if (!datasetId) {
      alert('Dataset ID is required. Sync cancelled.');
      return;
    }

    await createWebhook(model, datasetId);
    alert('Synced to dataset: ' + datasetId);
  },
});
