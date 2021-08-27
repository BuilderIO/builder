import appState from '@builder.io/app-context';
import pkg from '../package.json';

export const createWebhook = async (model: any) => {
  const customHeaders = [];

  for (const headerName in appState.user.authHeaders) {
    customHeaders.push({
      name: headerName,
      value: appState.user.authHeaders[headerName],
    });
  }
  const pluginSettings = appState.user.organization.value.settings.plugins?.get(pkg.name);
  const forceQA = pluginSettings.get('forceUseQaApi') === true;

  const newWebhook = {
    customHeaders,
    url: `${
      forceQA ? 'https://qa.builder.io' : appState.config.apiRoot()
    }/api/v1/sfcc-sync/webhook?&modelId=${model.id}&apiKey=${appState.user.apiKey}`,
    disableProxy: true, // proxy has an issue with the POST request body
  };

  model.webhooks.push(newWebhook);
  await appState.models.update(model, false);
  appState.snackBar.show('SFCC webhook saved');
};
