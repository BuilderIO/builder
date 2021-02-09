import { pluginId } from '../constants';
import appState from '@builder.io/app-context';

const headers = {
  'Content-Type': 'application/json',
  ...appState.user.authHeaders,
};

const proxyUrl = `${appState.config.apiRoot()}/api/v1/shopify`;

const deleteHook = async ({ id }: { id: string }) =>
  await fetch(`${proxyUrl}/webhooks/${id}.json?apiKey=${appState.user.apiKey}`, {
    method: 'DELETE',
    headers,
  });

const getAllRegisteredHooksOnTopic = async (topic: string) =>
  await fetch(
    `${proxyUrl}/webhooks.json?topic=${topic}&apiKey=${appState.user.apiKey}&cachebust=true`,
    { headers }
  )
    .then(res => res.json())
    .then(res => res.webhooks);

const createWebhookOnTopic = async (
  topic: string,
  resourceName: 'product' | 'collection',
  modelName: string
) => {
  await fetch(proxyUrl + `/webhooks.json?apiKey=${appState.user.apiKey}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      webhook: {
        address: `${appState.config.apiRoot()}/api/v1/shopify-sync?modelName=${modelName}&resourceName=${resourceName}&apiKey=${
          appState.user.apiKey
        }&pluginId=${pluginId}`,
        topic,
        format: 'json',
      },
    }),
  });
};

export const createWebhooks = async (resourceName: 'product' | 'collection', modelName: string) => {
  const topics = ['create', 'update', 'delete'].map(topic => `${resourceName}s/${topic}`);
  await Promise.all(
    topics.map(async topic => {
      const webhooks = await getAllRegisteredHooksOnTopic(topic);
      // deleting old webhooks so it doesn't confuse users ( maybe make it configurable)
      await Promise.all(webhooks.map(async (hook: any) => deleteHook(hook)));
      await createWebhookOnTopic(topic, resourceName, modelName);
    })
  );
};
