import { pluginId } from './constants';
import appState from '@builder.io/app-context';

export const syncToAlgolia = async (modelName: string) => {
  const pluginSettings = appState.user.organization.value.settings.plugins.get(pluginId);
  const algoliaKey = pluginSettings.get('algoliaKey');
  const algoliaAppId = pluginSettings.get('algoliaAppId');

  fetch(
    `${appState.config.apiRoot()}/api/v1/algolia-sync/${modelName}?apiKey=${
      appState.user.organization.value.id
    }`,
    {
      method: 'POST',
      headers: {
        ...appState.user.authHeaders,
      },
      body: JSON.stringify({
        algoliaKey,
        algoliaAppId,
      }),
    }
  );
};
