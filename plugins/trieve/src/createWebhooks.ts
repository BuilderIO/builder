import appState from "@builder.io/app-context";
import { pluginId } from "./pluginId";

export const createWebhook = async (model: any, datasetId: string) => {
  const pluginSettings =
    // @ts-ignore
    appState.user.organization.value.settings.plugins.get(pluginId);
  const trieveKey = pluginSettings.get("trieveApiKey");
  const baseUrl = pluginSettings.get("trieveBaseUrl");
  const pluginPrivateKey =
    // @ts-ignore
    await appState.globalState.getPluginPrivateKey(pluginId);

  if (!trieveKey || !baseUrl || !model) {
    // @ts-ignore
    appState.snackBar.show("Failed to create webhook");
    return;
  }

  const newWebhook = {
    meta: {
      pluginId,
    },
    customHeaders: [
      {
        name: "Authorization",
        value: `Bearer ${pluginPrivateKey}`,
      },
    ],
    url: `${baseUrl}/builder-webhook?trieveKey=${trieveKey}&trieveDataset=${datasetId}&modelId=${
      model.id
    }`,
    disableProxy: true,
  };

  let existingHookIndex;
  for (let i = 0; i < model.webhooks.length; i++) {
    if (model.webhooks[i].url.includes("builder-webhook")) {
      existingHookIndex = i;
      break;
    }
  }

  if (existingHookIndex) {
    model.webhooks[existingHookIndex] = newWebhook;
  } else {
    model.webhooks.push(newWebhook);
  }

  // @ts-ignore
  await appState.models.update(model, false);
  // @ts-ignore
  appState.snackBar.show("Trieve webhook saved");
};
