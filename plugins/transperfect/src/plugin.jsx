import { Builder } from "@builder.io/react";
import { Configuration } from "./components/Configuration/Configuration";
import {
  translateBulkAction,
  translateContentAction,
} from "./functions/translate";
import appState from "@builder.io/app-context";
import pkg from "../package.json";
import { registerDataPlugin } from "@builder.io/data-plugin-tools";
import { logData } from "./services";
import { CTA_TEXT } from "./constants";

Builder.register("content.bulkAction", translateBulkAction);
Builder.register("content.action", translateContentAction);

registerDataPlugin(
  {
    name: "GlobalLink",
    id: pkg.name,
    settings: [
      {
        name: "Globallinkurl",
        type: "string",
        required: true,
      },
      {
        name: "apiKey",
        type: "text",
        required: true,
      },
      {
        name: "connectorKey",
        type: "text",
        required: true,
      },
    ],
    ctaText: CTA_TEXT,
  },

  async (settings) => {
    appState.registerDataPlugin({ GlobalLink: settings });

    const pluginSettings =
      appState.user.organization.value.settings.plugins.get(pkg.name);
    const apiKey = pluginSettings.get("apiKey");
    const globallinkUrl = pluginSettings.get("Globallinkurl");
    const connectorKey = pluginSettings.get("connectorKey");

    if (connectorKey & globallinkUrl & apiKey) {
      await logData(
        globallinkUrl,
        apiKey,
        connectorKey,
        [],
        "CBI",
        "Successful- The GlobalLink settings was successfully saved."
      );
    }

    return settings;
  }
);

Builder.register("appTab", {
  name: "GlobalLink Enterprise",
  path: "configuration",
  icon: "https://connect.translations.com/logo/logos/G_GlobalLink.png",
  component: Configuration,
  priority: 2,
});
