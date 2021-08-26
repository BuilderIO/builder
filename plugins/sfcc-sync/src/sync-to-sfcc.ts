import appState from '@builder.io/app-context';

export const syncToSFCC = async (modelName: string) => {
  fetch(
    `${appState.config.apiRoot()}/api/v1/sfcc-sync/${modelName}?apiKey=${
      appState.user.organization.value.id
    }`,
    {
      method: 'POST',
      headers: {
        ...appState.user.authHeaders,
      },
    }
  );
};
