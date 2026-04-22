# Range Input Plugin for Builder.io

Adds a Range Input custom input type, which mimicks Builder's Image Component Aspect Ratio functionality. 

To install the plugin in your Builder.io Space:
* Navigate to Settings -> Plugins, and click the Edit button
* Click "Add Plugin" button, and enter `@builder.io/plugin-range-input` into the input field.

### Using the plugin

The plugin adds a new input type called `rangeInput`. This can be used in a Model field or UI State input by selecting it from the type dropdown, or referenced in a custom component's input type.


## Plugin Development

If this plugin doesn't suit your needs and you would like to modify it for your specific use case then read on to see how you can do so! You can find general information about plugins [here](https://www.builder.io/c/docs/plugins-overview).


### Install

```bash
git clone https://github.com/BuilderIO/builder.git
cd plugins/range-input
npm install
```

### Develop

```bash
npm run start
```

### Add the development plugin to Builder.io

From your [Space Settings](https://builder.io/account/space) (click the gear Settings icon in the left menu) click the edit button next to **Plugins**, click the "Add Plugin" and enter the development URL for this plugin in the text field (`http://localhost:1268/plugin.system.js?pluginId=@builder.io/plugin-range-input`) then hit save. The query parameter is necessary for Builder to know what the id of this plugin is, to identify the plugin's settings/configuration. 

Now as you develop you can reload the Builder interface to see the latest version of your plugin. (Plugins are loaded once per session, a refresh is required to see any code changes)

**NOTE:** Loading http:// content on an https:// website may give you a warning. Be sure to click the shield in the top right of your browser and choose "load unsafe scripts" to allow the http content on Builder's https site when developing locally.



To uninstall your plugin run just go back to your [Space Settings](https://builder.io/account/space) and click the edit button next to **Plugins**, click the X button to remove the plugin

### Frameworks

Builder.io uses [React](https://github.com/facebook/react) and [Material UI](https://github.com/mui-org/material-ui) for the UI, and [Emotion](https://github.com/emotion-js/emotion) for styling.

Using these frameworks in Builder plugins ensures best possible experience and performance.

### Publishing

If you think your plugin will benefit others in the Builder.io community you can send a pull request to this repo with your plugin, and we will review it! Otherwise, once your plugin is ready for use you can publish the package and add the link to its bundled JS in **Account Settings > Plugins** (enterprise only).


