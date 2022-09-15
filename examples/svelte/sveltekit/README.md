# Builder.io example with SvelteKit

This example shows our [Svelte SDK](/packages/sdks/output/svelte) with SvelteKit.

## Builder.io Setup

- log into builder.io
- from your account page, copy your API key and paste it into BUILDER_API_KEY in `src/apiKey.js`
- open the Builder.io Visual Editor for the model named "page"
- enter http://localhost:3000 in the URL bar to the top right of the preview in Builder
- drag a component into the layers tab, and it will appear in the Editor!

Checkout this Loom for a visual walkthrough: https://www.loom.com/share/afd7c9a1f8f148959ea0396be42560fd (it's originally intended for React-Native, but all of the steps are still the exact same)

## Status

For the status of the SDK, look at [these tables](/packages/sdks/README.md#feature-implementation).

## Build Setup

```bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev
# or start the server and open the app in a new browser tab
$ npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
