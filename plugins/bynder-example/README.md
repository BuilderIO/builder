# Bynder Plugin for Builder.io

## Notes
This is a starting point, not a complete integration. 
* The current output is the full Bynder file information object. This may or may not meet your needs.
* The plugin's main setup is configured in the `plugin.ts` file. 
* UI elements that handle loading the Bynder-provided Universal Compact View asset selector, and rendering the result as a preview in the `ui.tsx` file.
* Simple utils in `utils.ts`, largely CONSTS for consistency between files.
* Bynder's docs can be found (here)[https://developer-docs.bynder.com/ui-components], and their React-specific code docs (here)[https://www.npmjs.com/package/@bynder/compact-view]

### Using the plugin

To use the Bynder Universal Compact View widget in Builder.io you must create a custom component that leverages the `BynderSingleSelect` custom input type provided by this plugin. If you're not already familiar with creating custom components in Builder.io you can read more [here](https://www.builder.io/c/docs/custom-components-setup).

In your webapp register a custom component with an input of type `BynderSingleSelect`.

```jsx
// Builder.io React Gen1 SDK example
import { Builder } from '@builder.io/react'

Builder.registerComponent(
  (props) => {
    if (!props.bynderAsset) {
      return 'Choose an Image' // or render a placeholder image?
    }

    // choose the asset derivative name that matches your needs
    const {url, width, height} = props.bynderAsset.files.webImage
    return (
      <img
        src={url}
        width={width}
        height={height}
      />
    )
  },
  {
    name: 'BynderImage',
    image:
      'https://unpkg.com/css.gg@2.0.0/icons/svg/image.svg',
    inputs: [{ 
      name: 'bynderAsset', 
      type: 'BynderSingleSelect' 
    }],
  }
)
```

### Rainy Day Task List:
* Create & implement a multi-image select handler
* Per-instance file-type inputs like Builder's file input component
  * This will require an improvement on Builder's side to support
  * In the meantime, extending `BynderSingleSelect` by creating per-asset-type pickers would be the recommendation.
* Fix this odd bug:
  * Passing in the currently selected value does not appear to maintain the selection, despite passing in the assetID as defined in Bynder's docs.

### Idea: Builder Input replacement
If completely replacing access to the Builder file input component is desired, you would need to do the following:
* Change the name key from `"BynderSingleSelect"` to `"file"` when calling `Builder.registerEditor()`
* Ensure that the only values being saved in the onChange are the final URL of the image, matching the Builder file input type's format. 
* This could also be done as a toggle, conditionally changing the plugin's name from one to the other.

## Plugin Development

If this plugin doesn't suit your needs and you would like to modify it for your specific use case then read on to see how you can do so! You can find general information about plugins [here](https://www.builder.io/c/docs/plugins-overview).


### Install

```bash
git clone https://github.com/BuilderIO/builder.git
cd plugins/bynder-example
npm install
```

### Develop

```bash
npm run start
```

### Add the development plugin to Builder.io

From your [Account Settings](https://builder.io/account/space) page click the edit (pencil) button next to **Plugins** and enter the development URL for this plugin (e.g. `http://localhost:1268/plugin.system.js`) then hit save.

**NOTE:** Loading http:// content on an https:// website will give you a warning. Be sure to click the shield in the top right of your browser and choose "load unsafe scripts" to allow the http content on Builder's https site when devloping locally

<img alt="Load unsafe script example" src="https://i.stack.imgur.com/uSaLL.png">

Now as you develop you can restart Builder to see the latest version of your plugin.

To uninstall your plugin run just go back to your [Account Settings](https://builder.io/account/space) and click the edit (pencil) button next to **Plugins**, delete your development URL from the list and save

### Frameworks

Builder.io uses [React](https://github.com/facebook/react) and [Material UI](https://github.com/mui-org/material-ui) for the UI, and [Emotion](https://github.com/emotion-js/emotion) for styling.

Using these frameworks in Builder plugins ensures best possible experience and performance.

### Publishing

If you think your plugin will benefit others in the Builder.io community you can send a pull request to this repo with your plugin, and we will review it! Otherwise, once your plugin is ready for use you can publish the package and add the link to its bundled JS in **Account Settings > Plugins** (enterprise only).


