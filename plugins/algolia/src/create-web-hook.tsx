import { pluginId } from './constants';
import appState from '@builder.io/app-context';
import { getSnapshot, applySnapshot } from '@builder.io/mobx-state-tree';

const headers = {
  'Content-Type': 'application/json',
  ...appState.user.authHeaders,
};

export const createWebhook = async (modelName: string) => {
  const pluginSettings = appState.user.organization.value.settings.plugins.get(pluginId);
  const algoliaKey = pluginSettings.get('algoliaKey');
  const algoliaAppId = pluginSettings.get('algoliaAppId');

  const newWebhook = {
    customHeaders: [{ name: 'Content-Type', value: 'application/json' }],
    url: `${appState.config.apiEnv()}/api/v1/algolia-sync/webhook?algoliaKey=${algoliaKey}&algoliaAppId=${algoliaAppId}&modelName=${modelName}`,
  };

  // TODO: be smarter about finding existing webhooks and removing them
  const allWebHooks = appState.user.organization.value.webhooks.concat([newWebhook]);
  console.log('new hooks:', allWebHooks);
  applySnapshot(appState.user.organization.value.webhooks, allWebHooks);
  await appState.user.organization.save();
  appState.snackBar.show('Webhooks saved!');
};
