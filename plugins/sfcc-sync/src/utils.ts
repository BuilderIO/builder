export const getSFCCWebhookIndex = (model: { webhooks: Array<Map<string, string>> }) =>
  model.webhooks.findIndex(webhook => webhook.get('url')?.includes('sfcc-sync/webhook'));
