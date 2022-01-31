export const getSFCCWebhookIndex = (model: { webhooks: Array<any> }) =>
  model?.webhooks.findIndex(webhook => webhook.url?.includes('sfcc-sync/webhook'));
