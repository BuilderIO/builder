/** @jsx jsx */
import React from "react";
import { jsx } from "@emotion/core";
import appState from "@builder.io/app-context";
import { SubmissionModal } from "../components/SubmissionModal/SubmissionModal";
import pkg from "../../package.json";

function capitalizeFirstLetter(string) {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
}


export let translateBulkAction = {
  label: "Translate",
  showIf: (_content, _model) => true,
  onClick: async (_actions, selectedContentIds, contents) => {
    const selectedContentData = contents
      .filter((node) => selectedContentIds.includes(node.id))
      .map((node) => {
        const meta = node.meta
        const kind = meta.get("kind")
        return {
          id: node.id,
          name: node.name,
          filename: node.name,
          nodeModel: node.model.name,
          parentId: node.model.id,
          kind: capitalizeFirstLetter(kind)
        }
      });

    const pluginSettings =
      appState.user.organization.value.settings.plugins.get(pkg.name);



    const globallinkUrl = pluginSettings.get("Globallinkurl");
    const connectorsKey = pluginSettings.get("connectorKey");
    const apiKey = pluginSettings.get("apiKey");
    if (!globallinkUrl || !connectorsKey || !apiKey) {
      appState.location.go('/apps/configuration');
    } else {

      const close = await appState.globalState.openDialog(
        <SubmissionModal
          submitter={appState.user.data}
          selectedContentData={selectedContentData}
          connectorsKey={connectorsKey}
          globallinkUrl={globallinkUrl}
          apiKey={apiKey}
          onClose={() => close()}
        />
      );
      return close;
    }
  },
};

export let translateContentAction = {
  label: "Translate",
  showIf: (_content, _model) => true,
  onClick: async (content) => {
    const pluginSettings =
      appState.user.organization.value.settings.plugins.get(pkg.name);
    const GloballinkUrl = pluginSettings.get("Globallinkurl");
    const connectorsKey = pluginSettings.get("connectorKey");
    const apiKey = pluginSettings.get("apiKey");
    const meta = content.meta
    const kind = meta.get("kind")
    const selectedContentData = {
      id: content.id,
      name: content.name,
      filename: content.name,
      nodeModel: content.model.name,
      parentId: content.model.id,
      kind: capitalizeFirstLetter(kind)
    };
    if (!GloballinkUrl || !connectorsKey || !apiKey) {
      appState.location.go('/apps/configuration');
    } else {
      const close = await appState.globalState.openDialog(
        <SubmissionModal
          submitter={appState.user.data}
          selectedContentData={[selectedContentData]}
          connectorsKey={connectorsKey}
          globallinkUrl={GloballinkUrl}
          apiKey={apiKey}
          onClose={() => close()}
        />
      );
      return close;
    }
  },
};
