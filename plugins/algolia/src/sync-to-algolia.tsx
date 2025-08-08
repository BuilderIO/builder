import { pluginId } from './constants';
import appState from '@builder.io/app-context';

export const syncToAlgolia = async (modelName: string) => {
  const pluginSettings = appState.user.organization.value.settings.plugins.get(pluginId);
  const algoliaKey = pluginSettings.get('algoliaKey');
  const algoliaAppId = pluginSettings.get('algoliaAppId');
  const handleLargeRecordSizes = pluginSettings.get('handleLargeRecordSizes');

  const url = new URL(`${appState.config.apiRoot()}/api/v1/algolia-sync/${modelName}`);
  url.searchParams.set('apiKey', String(appState.user.organization.value.id));
  url.searchParams.set('handleLargeRecordSizes', handleLargeRecordSizes);

  fetch(url.toString(), {
    method: 'POST',
    headers: {
      ...appState.user.authHeaders,
    },
    body: JSON.stringify({
      algoliaKey,
      algoliaAppId,
    }),
  });
};
