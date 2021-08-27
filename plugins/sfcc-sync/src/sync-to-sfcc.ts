import appState from '@builder.io/app-context';
import pkg from '../package.json';

export const syncToSFCC = async (modelId: string) => {
  const pluginSettings = appState.user.organization.value.settings.plugins?.get(pkg.name);
  const forceQA = pluginSettings.get('forceUseQaApi') === true;

  await fetch(
    `${
      forceQA ? 'https://qa.builder.io' : appState.config.apiRoot()
    }/api/v1/sfcc-sync?modelId=${modelId}&apiKey=${appState.user.organization.value.id}`,
    {
      method: 'POST',
      headers: {
        ...appState.user.authHeaders,
      },
    }
  );
};
