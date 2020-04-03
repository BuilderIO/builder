# Builder.io Memsource connector plugin

See [here](src/plugin.tsx) for the React component that powers this plugin

## Using this plugin in production code

The idea behind the plugin is to generalize the use of a translation workflow directly connected to memsource.  
The requirements to use the plugin are quite simple:

- Your page model should have a field named `locale` and it should be an `enum`.
- Your page model should have a field named `memsourceToken` (which should be hidden) and it should be a text.

To add it to a page model simply create a new model field, with whichever name, and the type should be `Memsource Connector`. This will make the translations plugin available in each page created using that model.
There are a couple of optional fields:

- If you have a restriction for not supporting localisation from certain locales, create another `enum` in your model (also hidden) named `allowedLocales`. The plugin will read this value and stop anyone from translating from locales not within the `allowedLocales`.
- If you created a memsource input setting, that setting will have a ID field. If you want it to be used, just add a hidden model field `memsourceInputSettingsId` and the plugin will add it to the memsource job call.

Simply hit the `Localize` button, and it should bring up a Dialog divided by two sections:

- Source locale should only include a display of the page with the current locale
- Target locales should be a list of selectable locales, which is the product of eliminating the current locale from the enum aforementioned in the `locale` field.

## Creating a new plugin from this example

### Install

```bash
cd plugins/localization-connector
npm i
```

### Develop

```bash
npm run start:dev
```

**NOTE:** Loading http:// content on an https:// website will give you a warning. Be sure to click the shield in the top right of your browser and choose "load unsafe scripts" to allow the http content on Builder's https site when devloping locally

<img alt="Load unsafe script example" src="https://i.stack.imgur.com/uSaLL.png">

### Frameworks

Builder.io uses [React](https://github.com/facebook/react) and [Material UI](https://github.com/mui-org/material-ui) for the UI, and [Emotion](https://github.com/emotion-js/emotion) for styling.

Using these frameworks in Builder plugins ensures best possible experience and performance.
