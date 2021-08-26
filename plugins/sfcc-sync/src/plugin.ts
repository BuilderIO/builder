import { Builder } from '@builder.io/react';
import appState from '@builder.io/app-context';
import {  syncToSFCC } from './sync-to-sfcc';
import { createWebhook } from './create-web-hook';
import pkg from '../package.json';

Builder.register('plugin', {
  id: pkg.name,
  name: 'SFCC Content Sync',
  settings: [
    {
      name: 'algoliaKey',
      type: 'text',
      defaultValue: true,
      helperText: 'todo add here',
    },
    {
      name: 'algoliaAppId',
      type: 'text',
      defaultValue: true,
      helperText: 'todo add here',
    },
  ],

  ctaText: 'Save',

  async onSave(actions: OnSaveActions) {
    // update plugin setting
    await actions.updateSettings({
      hasConnected: true,
    });

    appState.dialogs.alert('Plugin settings saved.');
  },
});

interface OnSaveActions {
  updateSettings(partal: Record<string, any>): Promise<void>;
}

interface AppActions {
  triggerSettingsDialog(pluginId: string): Promise<void>;
}

Builder.register('app.onLoad', async ({ triggerSettingsDialog }: AppActions) => {
  const pluginSettings = appState.user.organization.value.settings.plugins?.get(pkg.name);
  const hasConnected = pluginSettings?.get('hasConnected');
  if (!hasConnected) {
    await triggerSettingsDialog(pkg.name);
  }
});

const getSFCCWebhookIndex = (model: { webhooks: Array<{url: string}>}) => model.webhooks.findIndex((webhook) => webhook.url.includes('sfcc-sync/webhook'))

Builder.register('model.action', {
  // TODO: uncomment once editor is released
  // name(model: any) {
  //   if (getSFCCWebhookIndex(model) === -1) {
  //     return 'Cancel syncing to SFCC'
  //   }
  //   return 'Sync to SFCC';
  // },
  name: 'Sync to SFCC',
  showIf() {
    return appState.user.can('admin');
  },
  async onClick(model: any) {
    const webhookIndex = getSFCCWebhookIndex(model);
    const confirmation = webhookIndex !== -1 ? `Remove syncing "${model.name}" entries to SFCC?` : `This will sync all current and future entries in the "${model.name}" model to SFCC`
    if (
      !(await appState.dialogs.confirm(
        confirmation,
        'Continue'
      ))
    ) {
      return;
    }
    appState.globalState.showGlobalBlockingLoadingIndicator = true;
    if (webhookIndex === -1) {
      await syncToSFCC(model.name);
      await createWebhook(model);
    } else {
      // TODO: remove webhook
    }
    appState.globalState.showGlobalBlockingLoadingIndicator = false;
  },
});
