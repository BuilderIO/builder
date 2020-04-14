# Builder.io Memsource connector plugin

See [here](src/plugin.tsx) for the React component that powers this plugin

## Using this plugin in production code

The idea behind the plugin is to generalize the use of a translation workflow directly connected to memsource.  
The requirements to use the plugin are quite simple:

- Your page model should have a field named `locale` and it should be an `enum`.
- Your page model should have a field named `memsourceProxyUrl` (which should be hidden) and it should be a text, or rather a stringified URL to your proxy for memsource.

To add it to a page model simply create a new model field, with whichever name, and the type should be `Memsource Connector`. This will make the translations plugin available in each page created using that model.
There are a couple of optional fields:

- If you have a restriction for not supporting localisation from certain locales, create another `enum` in your model (also hidden) named `allowedLocales`. The plugin will read this value and stop anyone from translating from locales not within the `allowedLocales`.

Simply hit the `Localize` button, and it should bring up a Dialog divided by two sections:

- Source locale should only include a display of the page with the current locale
- Target locales should be a list of selectable locales, which is the product of eliminating the current locale from the enum aforementioned in the `locale` field.

### When requesting localisation jobs

Given memsource disabled CORS, the request will be proxied to a service the user of the plugin will own. The plugin will fire a POST request to the `memsourceProxyUrl` host, and in the POST body, the following structure is used:

```json
{
    "proxy": {
        "projectName": "string",
        "sourceLocale": "string",
        "targetLocales": ["string-1", ..., "string-n"],
        "payload": {
            "__context": {
                // Key value pair equal to the page options, i.e. title, description and your custom fields
                // Also, a couple of values which add context to the request such as
                "locale": "requested source locale",
                "modelName": "model name",
                "pageId": "page id",
                "pageName": "page name",
                "title": "page title",
                "requestor": "email of the logged user who submitted the localisation job"
            },
            "content": [
                {
                    "__id": "string-builder-block-id",
                    "__optionKey": "string-builder-block-translatable-key",
                    "toTranslate": "string to be translated"
                },
                ...
            ]
        }
    }
}
```

Notice there are many fields with the double underscore `__` prefix, that is to symbolically represent a hidden field for memsource

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
