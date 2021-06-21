import { pluginId } from './constants';
import appState from '@builder.io/app-context';

export const createWebhook = async (model: any) => {
  const pluginSettings = appState.user.organization.value.settings.plugins.get(pluginId);
  const algoliaKey = pluginSettings.get('algoliaKey');
  const algoliaAppId = pluginSettings.get('algoliaAppId');
  const customHeaders = [];

  for (const headerName in appState.user.authHeaders) {
    customHeaders.push({
      name: headerName,
      value: appState.user.authHeaders[headerName],
    });
  }

  const newWebhook = {
    customHeaders,
    url: `${appState.config.apiRoot()}/api/v1/algolia-sync/webhook?algoliaKey=${algoliaKey}&algoliaAppId=${algoliaAppId}&modelName=${
      model.name
    }`,
    disableProxy: true, // proxy has an issue with the POST request body
  };

  // if we have an existing algolia webhook on this model then we need to replace it with the new one
  let existingAlgoliaHookIndex;
  for (let i = 0; i < model.webhooks.length; i++) {
    const currentHookPath = model.webhooks[i].url?.split('?')[0];
    const newHookPath = newWebhook.url.split('?')[0];
    existingAlgoliaHookIndex = currentHookPath === newHookPath ? i : null;
  }

  if (existingAlgoliaHookIndex) {
    model.webhooks[existingAlgoliaHookIndex] = newWebhook;
  } else {
    model.webhooks.push(newWebhook);
  }

  await appState.models.update(model, false);
  appState.snackBar.show('Algolia webhook saved');
};
