import { Builder } from '@builder.io/react';
import appState from '@builder.io/app-context';
import { syncToSFCC } from './sync-to-sfcc';
import { createWebhook } from './create-web-hook';
import pkg from '../package.json';

Builder.register('plugin', {
  id: pkg.name,
  name: 'SFCC Content Sync',
  settings: [
    {
      name: 'clientId',
      type: 'text',
      defaultValue: true,
      helperText: 'SFCC OCAPI client Id',
    },
    {
      name: 'password',
      type: 'password',
      helperText: 'SFCC OCAPI password',
    },
    ,
    {
      name: 'libraryName',
      type: 'text',
      defaultValue: 'RefArchGlobal',
      helperText: 'RefArchGlobal',
    },
    {
      name: 'forceUseQaApi',
      type: 'boolean',
      helperText: `Use Builder's QA API`,
    },
    {
      name: 'apiPath',
      type: 'text',
      helperText: 'SFCC API path, no trailing slash or sub path, just domain.com',
    },
  ],

  ctaText: 'Connect',

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

const getSFCCWebhookIndex = (model: { webhooks: Array<Map<string, string>> }) =>
  model.webhooks.findIndex(webhook => webhook.get('url')?.includes('sfcc-sync/webhook'));

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
    const confirmation =
      webhookIndex !== -1
        ? `Remove syncing "${model.name}" entries to SFCC?`
        : `This will sync all current and future entries in the "${model.name}" model to SFCC`;
    if (!(await appState.dialogs.confirm(confirmation, 'Continue'))) {
      return;
    }
    appState.globalState.showGlobalBlockingLoadingIndicator = true;
    if (webhookIndex === -1) {
      try {
        await syncToSFCC(model.id);
        await createWebhook(model);
      } catch (e) {
        console.error('error syncing model entries', e);
        appState.snackBar.show('Error syncing model entries, check console');
      }
    } else {
      model.webhooks.splice(webhookIndex, 1);
      await appState.models.update(model, false);
    }
    appState.globalState.showGlobalBlockingLoadingIndicator = false;
  },
});
