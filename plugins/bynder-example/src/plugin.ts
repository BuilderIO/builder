/** @jsx jsx */
import { jsx } from '@emotion/core'; // Required for Emotion to work
import { Builder } from '@builder.io/react';
import { AssetSelector } from './ui';

import {
  ASSET_FIELD_SELECTION,
  BYNDER_LANGUAGE,
  BYNDER_URL,
  SHOW_ASSET_FIELD_SELECTION,
  SupportedLanguages,
  pluginId,
} from './utils';

// Registering the custom input, a Bynder asset selector with the name "BynderAsset"
Builder.registerEditor({
  name: 'BynderAsset',
  icon: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwLjEgMC4xIDk1OS44MDAwMDAwMDAwMDAxIDcyMi43IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik05NTkuOSAyMjguM2MwIDU3LjgtMjEuOCAxMTEuNy01Ni40IDE1MWwtMjg1IDI4NS4zYy0zNS40IDM2LjEtODQgNTguMi0xMzguMSA1OC4yaC0uMWMtNTQuMSAwLTEwMy41LTIyLjMtMTM4LjktNTguNGwtMTkuOC0xOS41IDk2LjctOTYuNSAyMC41IDIwLjRjMTAuNCAxMC45IDI0LjggMTcuNyA0MS4xIDE3LjggMTYuMi0uMSAzMS40LTYuMiA0MS43LTE3LjJsMjczLjUtMjczLjFjMTUuMS0xNyAyMy0zNy43IDIzLTYwLjkuMi01MS40LTQwLjgtOTIuNy05Mi4yLTkyLjktMjMuNSAwLTQ0IDgtNjEuMiAyMy4yTDI1My4yIDU3Ni42IDU2LjMgMzc5LjFDMjEuOCAzMzkuOC4xIDI4NiAuMSAyMjguMy4xIDEwMi4yIDEwMi43LjIgMjI4LjkuMiAyODkuNC4yIDM0NC44IDIzIDM4NS41IDYxLjRsMjggMjgtOTcuMSA5N3MtMTUuNi0xNi0yMS0yMC45Yy0xNy4xLTE1LjEtMzcuNi0yMi45LTYwLjktMjMtNTEuNCAwLTkyLjcgNDAuOS05Mi44IDkyLjIgMCAyMy40IDcuOSA0NC4zIDIzLjEgNjEuNWw4Ny44IDg3LjZMNTU5LjMgNzcuOUM2MDEuMiAzMC4zIDY2Mi43LjEgNzMxLjIuMWMxMjYuMyAwIDIyOC43IDEwMi4xIDIyOC43IDIyOC4yeiIvPjwvc3ZnPg==',
  component: AssetSelector,
  // It would be nice if our plugin platform supported one or both of these
  // friendlyName: "Bynder Single Select",
  // helperText: "Bynder Single Select",
});

//  Register the plugin itself with Builder, to define plugin options that the input type will reference
Builder.register('plugin', {
  // id should match the name in package.json, which is why we grab it directly from the package.json
  id: pluginId,
  // will be used to prefix generated types
  name: 'Bynder',
  // a list of input definition that you might need to communicate with custom backend API
  settings: [
    {
      type: 'text',
      name: BYNDER_URL,
      friendlyName: 'Portal Domain',
      // defaultValue: "example.getbynder.com",
      helperText: "Set a default Bynder Portal domain, eg: 'example.getbynder.com'",
    },
    {
      type: 'string',
      name: BYNDER_LANGUAGE,
      friendlyName: 'Portal Language',
      defaultValue: 'en_US',
      enum: SupportedLanguages,
      helperText: 'Select the language for the Bynder Portal',
    },
    // Advanced features, could be removed if AssetFieldSelection is not needed:
    {
      type: 'boolean',
      advanced: true,
      name: SHOW_ASSET_FIELD_SELECTION,
      friendlyName: 'Use Asset Field Selection',
    },
    {
      type: 'longText',
      advanced: true,
      name: ASSET_FIELD_SELECTION,
      friendlyName: 'Asset Field Selection',
      helperText: `Optional: GraphQL selection for asset fields, see https://developer-docs.bynder.com/ui-components`,
      showIf: `!!options.get('${SHOW_ASSET_FIELD_SELECTION}')`,
    },
  ],
  // Modify the save button text
  ctaText: 'Save Changes',
  // If we need to make a request to validate anything:
  // async onSave(actions) {
  //   appState.dialogs.alert("Plugin settings saved.");
  // },
});
