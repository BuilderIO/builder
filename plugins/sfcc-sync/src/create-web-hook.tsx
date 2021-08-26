import appState from '@builder.io/app-context';

export const createWebhook = async (model: any) => {
  const customHeaders = [];

  for (const headerName in appState.user.authHeaders) {
    customHeaders.push({
      name: headerName,
      value: appState.user.authHeaders[headerName],
    });
  }

  const newWebhook = {
    customHeaders,
    url: `${appState.config.apiRoot()}/api/v1/sfcc-sync/webhook?&modelName=${
      model.name
    }&apiKey=${appState.user.apiKey}`,
    disableProxy: true, // proxy has an issue with the POST request body
  };

  model.webhooks.push(newWebhook);
  await appState.models.update(model, false);
  appState.snackBar.show('SFCC webhook saved');
};
