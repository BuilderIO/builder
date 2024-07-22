/** @jsx jsx */
import { jsx } from '@emotion/core'; // Required for Emotion to work
import { Builder } from '@builder.io/react';
import { SingleSelect } from './ui';

import {
  ASSET_FIELD_SELECTION,
  BYNDER_LANGUAGE,
  BYNDER_URL,
  SHOW_ASSET_FIELD_SELECTION,
  SupportedLanguages,
  pluginId,
} from './utils';

// This is registering the custom Bynder asset selector with the name "BynderSingleSelect"
Builder.registerEditor({
  name: 'BynderSingleSelect',
  icon: 'https://unpkg.com/css.gg@2.0.0/icons/svg/image.svg',
  component: SingleSelect,
  // It would be nice if our plugin platform supported one or both of these
  // friendlyName: "Bynder Single Select",
  // helperText: "Bynder Single Select",
});

//  Register the plugin itself with Builder
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
      // Ideally this should be used but it seems to break the app
      // showIf(options) {
      //   return !!options.get("showAssetFieldSelection") // also tried with .toJSON();
      // },
    },
  ],
  // Modify the save button text
  ctaText: 'Save Changes',
  // If we need to make a request to validate anything:
  // async onSave(actions) {
  //   appState.dialogs.alert("Plugin settings saved.");
  // },
});
